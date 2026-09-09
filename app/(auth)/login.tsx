'use client';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  const { login, reativar, enviarContestacao } = useAuth();

  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [rememberMe, setRememberMe] = useState(false);

  const [contaInativa, setContaInativa] = useState(false);
  const [contaBloqueada, setContaBloqueada] = useState(false);

  const [dadosBloqueio, setDadosBloqueio] = useState<any>(null);
  const [respostaContestacao, setRespostaContestacao] = useState('');
  const [enviandoContestacao, setEnviandoContestacao] = useState(false);

  const [reativando, setReativando] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        // Busca a notificação para mostrar o motivo e capturar o ID da notificação
        try {
          const resNotif = await fetch('http://localhost:8080/notificacoes/findAll');
          if (resNotif.ok) {
            const notifs = await resNotif.json();
            const listaNotifs = Array.isArray(notifs) ? notifs : (notifs?.content || notifs?.data || []);

            // Filtra pela notificação correspondente ao e-mail informado
            const minhaNotif = listaNotifs.find((n: any) => n.usuario?.gmail === formData.email.trim());
            setDadosBloqueio(minhaNotif || null);
          }
        } catch (errNotif) {
          console.error('Erro ao buscar notificacoes:', errNotif);
          setDadosBloqueio(null);
        }

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

  const handleEnviarContestacao = async () => {
    if (!respostaContestacao.trim()) {
      Alert.alert('Atenção', 'Escreva uma mensagem antes de enviar.');
      return;
    }

    const codNotificacao = dadosBloqueio?.codNotificacao || dadosBloqueio?.id;
    if (!codNotificacao) {
      Alert.alert('Erro', 'Não foi possível identificar o código da notificação de bloqueio.');
      return;
    }

    setEnviandoContestacao(true);
    const res = await enviarContestacao(codNotificacao, respostaContestacao);
    setEnviandoContestacao(false);

    if (res.ok) {
      Alert.alert('Sucesso', 'Sua contestação foi enviada para a análise do administrador!');
      setContaBloqueada(false);
      setRespostaContestacao('');
    } else {
      Alert.alert('Erro', res.error || 'Não foi possível enviar a contestação.');
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
    if (error) setError(null);
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

          <TouchableOpacity onPress={() => router.push('/register')} style={styles.registerContainer}>
            <Text style={styles.link}>
              Não possui uma conta? <Text style={styles.linkBold}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* MODAL BLOQUEADA COM CAMPO DE CONTESTAÇÃO */}
        <Modal visible={contaBloqueada} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Ionicons name="lock-closed" size={40} color={C.error} style={{ marginBottom: 10 }} />
              <Text style={[styles.modalTitle, { color: C.error }]}>Acesso Suspenso</Text>

              {/* Detalhes da notificação do bloqueio */}
              <View style={styles.detailsBox}>
                <Text style={styles.detailsLabel}>MOTIVO DA SUSPENSÃO:</Text>
                <Text style={styles.detailsText}>
                  {dadosBloqueio?.motivo || dadosBloqueio?.Motivo || 'Violação dos termos de uso'}
                </Text>

                <Text style={[styles.detailsLabel, { marginTop: 8 }]}>OBSERVAÇÃO DO ADMINISTRADOR:</Text>
                <Text style={styles.detailsDesc}>
                  {dadosBloqueio?.descricao || dadosBloqueio?.Descricao || 'Nenhuma descrição detalhada informada.'}
                </Text>
              </View>

              {/* Campo de Texto para Contestação */}
              <Text style={styles.contestLabel}>Deseja contestar este bloqueio? Escreva sua mensagem:</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Explique o ocorrido para o administrador..."
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={3}
                value={respostaContestacao}
                onChangeText={setRespostaContestacao}
              />

              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={[styles.modalSecondaryBtn]}
                  onPress={() => setContaBloqueada(false)}
                >
                  <Text style={styles.modalSecondaryBtnText}>Fechar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalPrimaryBtn, enviandoContestacao && { opacity: 0.6 }]}
                  disabled={enviandoContestacao}
                  onPress={handleEnviarContestacao}
                >
                  {enviandoContestacao ? (
                    <ActivityIndicator color={C.white} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Enviar</Text>
                  )}
                </TouchableOpacity>
              </View>
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
  registerContainer: { alignItems: 'center', marginTop: 24 },
  link: { color: C.textSub, fontSize: 14 },
  linkBold: { color: C.accent, fontWeight: '700' },
  errorContainer: { backgroundColor: C.errorBg, borderWidth: 1, borderColor: C.errorBorder, padding: 14, borderRadius: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  errorText: { color: C.error, fontSize: 14, flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  modalBox: { width: '100%', backgroundColor: C.white, borderRadius: 24, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: C.accent, marginBottom: 12 },
  modalDesc: { fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  modalButton: { width: '100%', height: 52, borderRadius: 16, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  detailsBox: { width: '100%', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  detailsLabel: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  detailsText: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginTop: 2 },
  detailsDesc: { fontSize: 13, color: '#334155', marginTop: 2 },
  contestLabel: { fontSize: 12, fontWeight: '700', color: C.textPrimary, alignSelf: 'flex-start', marginBottom: 6 },
  textArea: { width: '100%', height: 80, backgroundColor: C.accentSoft, borderRadius: 12, borderWidth: 1, borderColor: C.accentBorder, padding: 12, textAlignVertical: 'top', color: C.textPrimary, fontSize: 13, marginBottom: 16 },
  modalActionsRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', gap: 10 },
  modalSecondaryBtn: { paddingVertical: 12, paddingHorizontal: 18, backgroundColor: '#E2E8F0', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalSecondaryBtnText: { color: '#475569', fontWeight: '700', fontSize: 14 },
  modalPrimaryBtn: { flex: 1, height: 46, backgroundColor: '#0284C7', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});