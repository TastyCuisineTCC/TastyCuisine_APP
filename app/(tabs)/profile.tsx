import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { usuariosAPI } from '../(auth)/api';
import { uploadImageToSupabase } from '../(services)/uploadImageToSupabase';
import BolinhaqGira from '../../components/BolinhaqGira';
import BottomNavigation from '../../components/BottomNavigation';
import { useAuth } from '../authContext';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:              '#F5EDE3',
  surface:         '#FFFFFF',
  surfaceHi:       '#F0E6DA',
  hero:            '#C4703A',
  accent:          '#C4703A',
  accentSoft:      '#FFF0E8',
  accentBorder:    '#F0C8A0',
  danger:          '#D94F4F',
  dangerSoft:      '#FFF0F0',
  textPrimary:     '#3D2010',
  textSub:         '#B8906A',
  textMuted:       '#D4B89A',
  textOnHero:      '#FFFFFF',
  textOnHeroSub:   'rgba(255,230,200,0.85)',
  textOnHeroFaint: 'rgba(255,220,180,0.65)',
  white:           '#FFFFFF',
  green:           '#6DB86D',
};

interface UserStats {
  favoritos: number;
  avaliacoes: number;
}

// ─── URL base da API ──────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8080';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, userId, logout, loading, favoritos, getComentariosByUser, updateUser, EditPhoto } = useAuth();

  const [editModalVisible,   setEditModalVisible]   = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [savingPhoto,  setSavingPhoto]  = useState(false);
  const [stats,        setStats]        = useState<UserStats>({ favoritos: 0, avaliacoes: 0});
  const [loadingStats, setLoadingStats] = useState(true);
  const [form, setForm] = useState({
    nome_completo:  user?.nome_completo  ?? '',
    gmail:         user?.gmail         ?? '',
    senha: '',
  });

  useEffect(() => {
    if (!userId && !loading) router.push('/login');
  }, [loading]);

  // Busca stats do usuário
  useEffect(() => {
    if (!userId) return;
    
    async function fetchStats() {
      setLoadingStats(true);
      try {
        const comentarios = await getComentariosByUser(userId!);
        setStats({
          favoritos: favoritos.length,
          avaliacoes: comentarios.length,
        });
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, [userId, favoritos]);

  // ── Seleciona foto da galeria e envia ao backend ──────────────────────────
 const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria para trocar a foto de perfil.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      // Não precisamos mais do base64: true aqui, pois a nossa função de upload lê o arquivo pela URI
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const asset = result.assets[0];
    const imageUri = asset.uri;

    setSavingPhoto(true);
    try {
      // 1. Faz o upload da imagem para o Supabase Storage e pega a URL pública
      const publicUrl = await uploadImageToSupabase(imageUri, userId);

      if (!publicUrl) {
        throw new Error('Falha no upload para o Supabase');
      }

      // 2. Envia a URL gerada para a sua API
      const res = await fetch(`${API_BASE}/usuario/${userId}/foto`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fotoPerfil: publicUrl }), // Enviando a URL em vez do base64 pesado
      });

      if (!res.ok) throw new Error('Falha ao salvar foto na API');
      
      const usuarioAtualizado = await res.json();
      updateUser(usuarioAtualizado);
      
      Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível salvar a foto. Tente novamente.');
    } finally {
      setSavingPhoto(false);
    }
  };

    const openEdit = () => {
      console.log(user)
    setForm({
      nome_completo:   user?.nome_completo   ?? '',
      gmail:          user?.gmail          ?? '',
      senha: '',
    });
    
    // Se o objeto 'user' tiver o campo da data salva no banco, ele preenche aqui
    setEditModalVisible(true);
  };
 

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);


    const payload: any = {
      nome_completo:   form.nome_completo,
      gmail:          form.gmail,
    };

    if (form.senha.trim()) payload.senha = form.senha;

    try {
      const res = await usuariosAPI.update(userId, payload);
      if (res.data) {
        updateUser({
          ...user!,
          ...(res.data as typeof user),
        });
        setEditModalVisible(false);
      } else {
        Alert.alert('Erro', res.error ?? 'Não foi possível salvar as alterações.');
      }
    } catch {
      Alert.alert('Erro', 'Ocorreu um erro ao conectar com o servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userId) return;
    setDeleting(true);
    const res = await usuariosAPI.inativar(userId);
    setDeleting(false);
    if (!res.error) {
      setDeleteModalVisible(false);
      logout();
      router.replace('/(auth)/login');
    } else {
      setDeleteModalVisible(false);
      Alert.alert('Erro', res.error ?? 'Erro ao inativar conta.');
    }
  };

  if (loading) return <BolinhaqGira />;

  const restricoes = user?.restricoesAlimentares
    ? (user.restricoesAlimentares as string)
        .split(',')
        .map((r: string) => r.trim())
        .filter(Boolean)
    : [];

  const avatarSource = user?.fotoPerfil
    ? { uri: user.fotoPerfil }
    : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nome_completo ?? 'U')}&background=C4703A&color=fff&size=200` };

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.hero} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO ── */}
        <View style={s.hero}>
          <View style={s.blob1} />
          <View style={s.blob2} />
          <View style={s.blob3} />

          <Text style={s.pageLabel}>MEU PERFIL</Text>

          <TouchableOpacity
            style={s.avatarWrap}
            onPress={handlePickPhoto}
            activeOpacity={0.85}
            disabled={savingPhoto}
          >
            <Image source={avatarSource} style={s.avatarImg} />
            <View style={s.avatarOverlay}>
              {savingPhoto
                ? <ActivityIndicator color={C.white} size="small" />
                : <Ionicons name="camera" size={20} color={C.white} />}
            </View>
            {!savingPhoto && <View style={s.statusDot} />}
          </TouchableOpacity>

          <Text style={s.heroName}>{user?.nome_completo ?? 'Usuário'}</Text>
          <Text style={s.heroEmail}>{user?.gmail ?? ''}</Text>

          <View style={s.statsRow}>
            <StatBox value={!loadingStats ? String(stats.favoritos) : '…'} label="Favoritos" />
            <View style={s.statsDivider} />
            <StatBox value={!loadingStats ? String(stats.avaliacoes) : '…'} label="Avaliações" />
          </View>
        </View>

        {/* ── RESTRIÇÕES ── */}
        {restricoes.length > 0 && (
          <>
            <Text style={s.sectionLabel}>RESTRIÇÕES ALIMENTARES</Text>
            <View style={s.restricoesWrap}>
              {restricoes.map((r, i) => (
                <View key={i} style={s.restricaoTag}>
                  <Ionicons name="alert-circle-outline" size={13} color={C.accent} />
                  <Text style={s.restricaoText}>{r}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── AÇÕES ── */}
        <Text style={s.actionRow}></Text>
        <Text style={s.sectionLabel}>CONFIGURAÇÕES</Text>

        <View style={s.card}>
          <ActionRow icon="create-outline" label="Editar perfil" onPress={openEdit} />
          <Divider />
          <ActionRow
            icon="log-out-outline"
            label="Sair da conta"
            color={C.accent}
            onPress={() => { logout(); router.replace('/(auth)/login'); }}
          />
          <Divider />
          <ActionRow
            icon="trash-outline"
            label="Inativar conta"
            color={C.danger}
            onPress={() => setDeleteModalVisible(true)}
          />
        </View>

        <Text style={s.versionText}>v3.4.7</Text>
      </ScrollView>

      {/* ── EDIT MODAL ── */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.dragPill} />

            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={s.closeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color={C.textSub} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 8 }}>
              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>Nome completo</Text>
                <TextInput
                  style={s.fieldInput}
                  value={form.nome_completo}
                  onChangeText={v => setForm(f => ({ ...f, nome_completo: v }))}
                  placeholder="Seu nome completo"
                  placeholderTextColor={C.textMuted}
                />
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>Email</Text>
                <TextInput
                  style={s.fieldInput}
                  value={form.gmail}
                  onChangeText={v => setForm(f => ({ ...f, gmail: v }))}
                  placeholder="voce@email.com"
                  placeholderTextColor={C.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>Nova senha</Text>
                <TextInput
                  style={s.fieldInput}
                  value={form.senha}
                  onChangeText={v => setForm(f => ({ ...f, senha: v }))}
                  placeholder="Deixe em branco para manter"
                  placeholderTextColor={C.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[s.primaryBtn, saving && { opacity: 0.55 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color={C.white} />
                : <Text style={s.primaryBtnText}>Salvar alterações</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── DELETE MODAL ── */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, s.alertSheet]}>
            <View style={s.alertIcon}>
              <Ionicons name="warning-outline" size={32} color={C.danger} />
            </View>
            <Text style={s.alertTitle}>Inativar conta</Text>
            <Text style={s.alertBody}>
              Tem certeza que deseja inativar sua conta? Você será desconectado e não poderá acessar suas informações.
            </Text>
            <TouchableOpacity
              style={[s.primaryBtn, { backgroundColor: C.danger }, deleting && { opacity: 0.55 }]}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting
                ? <ActivityIndicator color={C.white} />
                : <Text style={s.primaryBtnText}>Sim, inativar</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={s.ghostBtn}
              onPress={() => setDeleteModalVisible(false)}
              disabled={deleting}
            >
              <Text style={s.ghostBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <BottomNavigation />
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.statBox}>
      <Text style={s.statNum}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

function ActionRow({
  icon, label, color = C.textPrimary, onPress,
}: {
  icon: string; label: string; color?: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.actionRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.iconBubble, { backgroundColor: color === C.danger ? C.dangerSoft : C.accentSoft }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[s.actionLabel, { color }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={color + '66'} />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={s.divider} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safeArea:     { flex: 1, backgroundColor: C.hero },
  scroll:       { flex: 1, backgroundColor: C.bg },
  scrollContent:{ paddingBottom: 48 },

  hero: {
    backgroundColor: C.hero,
    paddingTop: Platform.OS === 'android' ? 72 : 60,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  blob1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -70, right: -50,
  },
  blob2: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,180,100,0.10)', bottom: -40, left: -30,
  },
  blob3: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)', top: 40, left: 70,
  },
  pageLabel: {
    color: 'rgba(255,230,200,0.75)', fontSize: 10, fontWeight: '700',
    letterSpacing: 3, marginBottom: 18,
  },

  avatarWrap: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.25,
    shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  avatarImg: {
    width: '100%', height: '100%', borderRadius: 45,
  },
  avatarOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 32, borderBottomLeftRadius: 45, borderBottomRightRadius: 45,
    backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center', justifyContent: 'center',
  },
  statusDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: C.green, borderWidth: 2.5, borderColor: C.hero,
  },

  heroName:   { color: C.textOnHero,      fontSize: 22, fontWeight: '800', marginBottom: 3 },
  heroHandle: { color: C.textOnHeroSub,   fontSize: 14, fontWeight: '600', marginBottom: 2 },
  heroEmail:  { color: C.textOnHeroFaint, fontSize: 12, marginBottom: 20 },

  statsRow: {
    flexDirection: 'row', alignSelf: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 18, overflow: 'hidden',
  },
  statBox:      { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statNum:      { color: C.white, fontSize: 22, fontWeight: '800', lineHeight: 26 },
  statLbl:      { color: 'rgba(255,230,200,0.75)', fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginTop: 2, textTransform: 'uppercase' },
  statsDivider: { width: 0.5, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 12 },

  restricoesWrap: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, paddingHorizontal: 16, marginBottom: 4,
  },
  restricaoTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.accentSoft, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 0.5, borderColor: C.accentBorder,
  },
  restricaoText: { color: C.accent, fontSize: 12, fontWeight: '600' },

  sectionLabel: {
    color: C.textSub, fontSize: 10, fontWeight: '700',
    letterSpacing: 2.5, marginLeft: 20, marginBottom: 10, marginTop: 20,
  },

  card: {
    backgroundColor: C.surface,
    marginHorizontal: 16, borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5, borderColor: '#EDE0D4',
    shadowColor: '#8B5028', shadowOpacity: 0.08,
    shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 16, gap: 14,
  },
  iconBubble: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: C.textPrimary },
  divider:     { height: StyleSheet.hairlineWidth, backgroundColor: C.surfaceHi, marginHorizontal: 18 },

  versionText: { color: C.textMuted, textAlign: 'center', fontSize: 12, marginTop: 32, letterSpacing: 0.5 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(61,32,16,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, maxHeight: '92%',
  },
  dragPill: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.surfaceHi, alignSelf: 'center', marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 22,
  },
  modalTitle: { color: C.textPrimary, fontSize: 20, fontWeight: '800' },
  closeBtn:   { backgroundColor: C.surfaceHi, borderRadius: 10, padding: 6 },

  fieldGroup: { marginBottom: 18 },
  fieldLabel: { color: C.textSub, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  fieldInput: {
    backgroundColor: '#FBF5EF', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: C.textPrimary,
    borderWidth: 1, borderColor: C.accentBorder,
  },

  primaryBtn: {
    backgroundColor: C.accent,
    paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: C.accent, shadowOpacity: 0.3,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryBtnText: { color: C.white, fontSize: 16, fontWeight: '800' },
  ghostBtn:       { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  ghostBtnText:   { color: C.textSub, fontSize: 15, fontWeight: '600' },

  alertSheet: { alignItems: 'center', paddingBottom: 32 },
  alertIcon: {
    backgroundColor: C.dangerSoft, width: 64, height: 64,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, marginTop: 8,
  },
  alertTitle: { color: C.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  alertBody:  {
    color: C.textSub, fontSize: 14, lineHeight: 22,
    textAlign: 'center', marginBottom: 24, paddingHorizontal: 8,
  },
});