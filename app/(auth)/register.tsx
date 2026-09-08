'use client';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
  textOnHeroSub: 'rgba(255,230,200,0.85)',
  error: '#D32F2F',
  errorBg: '#FDECEC',
  errorBorder: '#F3C7C7',
};

interface RegisterFormData {
  nomeCompleto: string;
  email: string;
  senha: string;
  confirmarSenha?: string;
  funcao: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [birthDate, setBirthDate] = useState<string>('');
  const [formData, setFormData] = useState<RegisterFormData>({
    nomeCompleto: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    funcao: 'Usuario',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const formatBirthDate = (text: string): string => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const calculateAge = (dateString: string): number | null => {
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;

    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);

    if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) return null;

    const birth = new Date(year, month - 1, day);
    if (birth.getDate() !== day || birth.getMonth() !== month - 1 || birth.getFullYear() !== year) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const convertToDateObject = (dateString: string): Date | null => {
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  };

  const handleRegister = async () => {
    if (!formData.nomeCompleto.trim() || !birthDate.trim() || !formData.email.trim() || !formData.senha.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (!validateEmail(formData.email.trim())) {
      setError('E-mail em formato inválido. Use um e-mail como exemplo@dominio.com');
      return;
    }

    const idadeCalculada = calculateAge(birthDate);

    if (idadeCalculada === null) {
      setError('Data de nascimento inválida.');
      return;
    }

    if (idadeCalculada < 14 || idadeCalculada > 100) {
      setError('Você deve ter entre 14 e 100 anos para se cadastrar.');
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    const dataObjeto = convertToDateObject(birthDate);
    if (!dataObjeto) {
      setError('Erro ao processar a data.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await register(
        formData.nomeCompleto.trim(),
        dataObjeto,
        formData.email.trim(),
        formData.senha
      );

      if (!response.ok) {
        setError(response.error || 'Erro ao criar conta.');
        return;
      }

      router.replace('/home');
    } catch (err) {
      console.error(err);
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: keyof RegisterFormData, value: string) => {
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
          <Text style={styles.heroTitle}>Criar Conta</Text>
          <Text style={styles.heroSubtitle}>Cadastre-se e descubra milhares de receitas.</Text>
        </LinearGradient>

        <View style={styles.card}>
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={C.error} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="Digite seu nome completo"
            placeholderTextColor={C.textMuted}
            value={formData.nomeCompleto}
            onChangeText={(v) => handleChange('nomeCompleto', v)}
          />

          <Text style={styles.label}>Data de Nascimento</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={C.textMuted}
            keyboardType="number-pad"
            maxLength={10}
            value={birthDate}
            onChangeText={(text) => {
              if (error) setError(null);
              setBirthDate(formatBirthDate(text));
            }}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="exemplo@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={C.textMuted}
            value={formData.email}
            onChangeText={(v) => handleChange('email', v)}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="Digite sua senha"
            secureTextEntry
            placeholderTextColor={C.textMuted}
            value={formData.senha}
            onChangeText={(v) => handleChange('senha', v)}
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={C.white} /> : <Text style={styles.primaryButtonText}>Criar Conta</Text>}
          </TouchableOpacity>

          {/* Google Button */}
          {/* <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>ou continue com</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.googleButton}>
            <Image source={require('../../assets/images/google.png')} style={styles.googleIcon} />
            <Text style={styles.googleText}>Google</Text>
          </TouchableOpacity> */}

          <TouchableOpacity onPress={() => router.push('/login')} style={styles.loginLinkContainer}>
            <Text style={styles.link}>
              Já possui uma conta? <Text style={styles.linkBold}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { height: 280, justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  blob1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.06)', top: -70, left: -60 },
  blob2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.05)', right: -40, top: 40 },
  blob3: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -30, left: 100 },
  logo: { width: 170, height: 70, marginBottom: 16 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: C.white },
  heroSubtitle: { marginTop: 8, color: C.textOnHeroSub, textAlign: 'center', fontSize: 15, paddingHorizontal: 35 },
  card: { marginHorizontal: 18, marginTop: -35, backgroundColor: C.surface, borderRadius: 28, padding: 22, elevation: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  errorContainer: { backgroundColor: C.errorBg, borderWidth: 1, borderColor: C.errorBorder, padding: 12, borderRadius: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center' },
  errorText: { color: C.error, fontSize: 14, flex: 1, fontWeight: '600' },
  label: { color: C.textPrimary, fontWeight: '700', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: C.accentSoft, borderRadius: 14, paddingHorizontal: 18, height: 54, fontSize: 16, color: C.textPrimary, borderWidth: 1, borderColor: C.accentBorder },
  inputError: { borderColor: C.error },
  primaryButton: { backgroundColor: C.accent, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  primaryButtonText: { color: C.white, fontSize: 17, fontWeight: '700' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: C.accentBorder },
  dividerText: { marginHorizontal: 12, color: C.textSub, fontSize: 13 },
  googleButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.accentBorder, borderRadius: 16, height: 54, backgroundColor: C.white },
  googleIcon: { width: 22, height: 22, marginRight: 10 },
  googleText: { fontWeight: '600', color: C.textPrimary, fontSize: 16 },
  loginLinkContainer: { marginTop: 26, alignItems: 'center' },
  link: { color: C.textSub, fontSize: 15 },
  linkBold: { color: C.accent, fontWeight: '700' },
});