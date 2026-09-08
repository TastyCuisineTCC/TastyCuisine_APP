'use client';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../authContext';

const C = {
  bg: '#F5EDE3',
  surface: '#FFFFFF',
  hero: '#C4703A',
  accent: '#C4703A',
  accentSoft: '#FFF0E8',
  accentBorder: '#F0C8A0',
  white: '#FFFFFF',
  textPrimary: '#3D2010',
  textSub: '#B8906A',
  textMuted: '#D4B89A',
  textOnHero: '#FFFFFF',
  textOnHeroSub: 'rgba(255,235,220,0.9)',
  error: '#D32F2F',
  errorBg: '#FDECEC',
  errorBorder: '#F3C7C7',
};

export default function LoginScreen() {
  const router = useRouter();
  const { login, reativar } = useAuth();

  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [rememberMe, setRememberMe] = useState(false);

  const [contaInativa, setContaInativa] = useState(false);
  const [contaBloqueada, setContaBloqueada] = useState(false);

  const [reativando, setReativando] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validação de formato de Email
  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    if (!formData.email.trim() || !formData.senha.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (!validateEmail(formData.email.trim())) {
      setError('Por favor, digite um e-mail válido.');
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await login(formData.email.trim(), formData.senha);

      if (result.ok) {
        router.replace('/home');
      } else if (result.error === 'CONTA_BLOQUEADA') {
        setContaBloqueada(true);
      } else if (result.error === 'CONTA_INATIVA') {
        setContaInativa(true);
      } else if (result.error === 'ACESSO_NEGADO') {
        setError('Apenas usuários podem acessar o aplicativo.');
      } else {
        setError(result.error || 'Email ou senha incorretos.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReativar = async () => {
    if (confirmarSenha !== formData.senha) {
      setError('As senhas não coincidem.');
      setContaInativa(false);
      return;
    }

    setReativando(true);
    const res = await reativar(formData.email, formData.senha);
    setReativando(false);

    if (res) {
      setContaInativa(false);
      setConfirmarSenha('');
      router.replace('/home');
    } else {
      setError('Email ou senha incorretos.');
      setContaInativa(false);
      setConfirmarSenha('');
    }
  };

  const handleChange = (name: string, value: string) => {
    if (error) setError(null); // Limpa o erro ao digitar
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.hero }}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={{ flex: 1, backgroundColor: C.bg }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={['#C4703A', '#A95C2C', '#7A3B1E']} style={styles.hero}>
          <View style={styles.blob1} />
          <View style={styles.blob2} />
          <View style={styles.blob3} />

          <Image source={require('../../assets/images/T.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.heroTitle}>Bem-vindo!</Text>
          <Text style={styles.heroSubtitle}>Entre em sua conta e continue descobrindo milhares de receitas.</Text>
        </LinearGradient>

        <View style={styles.card}>
          {/* TRATAMENTO DE ERROS */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={C.error} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={formData.email}
            onChangeText={(v) => handleChange('email', v)}
            style={[styles.input, error && styles.inputError]}
            placeholder="exemplo@exemplo.com"
            placeholderTextColor={C.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            value={formData.senha}
            onChangeText={(v) => handleChange('senha', v)}
            style={[styles.input, error && styles.inputError]}
            placeholder="Digite sua senha"
            placeholderTextColor={C.textMuted}
            secureTextEntry={!rememberMe}
          />

          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
              <Text style={styles.optionText}>Mostrar senha</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Linking.openURL('https://accounts.google.com/signin/recovery')}>
              <Text style={styles.optionText}>Esqueceu?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.6 }]}
            disabled={loading}
            onPress={handleSubmit}
          >
            {loading ? <ActivityIndicator color={C.white} /> : <Text style={styles.primaryButtonText}>Entrar</Text>}
          </TouchableOpacity>


          {/* Google button */}
          {/* <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>ou continue com</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.googleButton}>
            <Image source={require('../../assets/images/google.png')} style={styles.googleIcon} />
            <Text style={styles.googleText}>Google</Text>
          </TouchableOpacity> */}

          <TouchableOpacity onPress={() => router.push('/register')} style={styles.registerContainer}>
            <Text style={styles.link}>
              Não possui uma conta? <Text style={styles.linkBold}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* MODAL BLOQUEADA */}
        <Modal visible={contaBloqueada} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Ionicons name="lock-closed" size={40} color={C.error} style={{ marginBottom: 10 }} />
              <Text style={[styles.modalTitle, { color: C.error }]}>Acesso Suspenso</Text>
              <Text style={styles.modalDesc}>
                Esta conta foi bloqueada por um administrador devido à violação das regras da comunidade.
              </Text>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: C.error }]} onPress={() => setContaBloqueada(false)}>
                <Text style={styles.primaryButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MODAL REATIVAR */}
        <Modal visible={contaInativa} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Conta Inativa</Text>
              <Text style={styles.modalDesc}>Confirme sua senha para reativar sua conta.</Text>
              <TextInput
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                style={styles.input}
                secureTextEntry
                placeholder="Confirme sua senha"
                placeholderTextColor={C.textMuted}
              />
              <TouchableOpacity
                style={[styles.modalButton, (reativando || !confirmarSenha) && { opacity: 0.6 }]}
                disabled={reativando || !confirmarSenha}
                onPress={handleReativar}
              >
                {reativando ? <ActivityIndicator color={C.white} /> : <Text style={styles.primaryButtonText}>Reativar Conta</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 18 }} onPress={() => setContaInativa(false)}>
                <Text style={styles.linkBold}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { height: 300, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  blob1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.08)', top: -40, right: -20 },
  blob2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: 30, left: -20 },
  blob3: { position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.08)', bottom: 70, right: 40 },
  logo: { width: 170, height: 70, marginBottom: 20 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: C.white },
  heroSubtitle: { marginTop: 10, textAlign: 'center', color: C.textOnHeroSub, fontSize: 15, lineHeight: 22, paddingHorizontal: 20 },
  card: { marginHorizontal: 20, marginTop: -35, backgroundColor: C.surface, borderRadius: 28, padding: 24, elevation: 10, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 6 } },
  label: { fontSize: 13, fontWeight: '700', color: C.textSub, marginBottom: 8, marginTop: 12 },
  input: { height: 55, backgroundColor: C.accentSoft, borderRadius: 16, borderWidth: 1, borderColor: C.accentBorder, paddingHorizontal: 18, color: C.textPrimary, fontSize: 15, marginBottom: 8 },
  inputError: { borderColor: C.error },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 18 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: C.accent, marginRight: 8, backgroundColor: C.white },
  checkboxChecked: { backgroundColor: C.accent },
  optionText: { color: C.textSub, fontSize: 13 },
  primaryButton: { height: 56, borderRadius: 18, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center', marginTop: 5 },
  primaryButtonText: { color: C.white, fontWeight: '700', fontSize: 16 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: C.accentBorder },
  dividerText: { marginHorizontal: 12, color: C.textSub, fontSize: 12 },
  googleButton: { height: 55, borderRadius: 16, borderWidth: 1, borderColor: C.accentBorder, backgroundColor: C.white, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  googleIcon: { width: 22, height: 22, marginRight: 10 },
  googleText: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
  registerContainer: { alignItems: 'center', marginTop: 24 },
  link: { color: C.textSub, fontSize: 14 },
  linkBold: { color: C.accent, fontWeight: '700' },
  errorContainer: { backgroundColor: C.errorBg, borderWidth: 1, borderColor: C.errorBorder, padding: 14, borderRadius: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  errorText: { color: C.error, fontSize: 14, flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  modalBox: { width: '100%', backgroundColor: C.white, borderRadius: 24, padding: 26, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: C.accent, marginBottom: 12 },
  modalDesc: { fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  modalButton: { width: '100%', height: 52, borderRadius: 16, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
});