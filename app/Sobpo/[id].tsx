import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BolinhaqGira from '../../components/BolinhaqGira';
import { useAuth } from '../authContext';
import { C } from '../constants/colors';

const str = (v: any): string => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
};

type Ingrediente = { quantidade: string; unidade: string; nome: string };

const parseIngredientes = (raw: any): Ingrediente[] => {
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(arr)) {
      return arr.map((item: any) => ({
        quantidade: str(item?.quantidade),
        unidade: str(item?.unidade),
        nome: str(item?.nome),
      }));
    }
  } catch { }
  return [];
};

const parsePassos = (raw: any): string[] => {
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(arr)) return arr.map((item: any) => str(item));
  } catch { }
  if (typeof raw === 'string') return raw.split('\n').filter(Boolean);
  return [];
};

const formatDate = (raw: any): string => {
  if (!raw) return '';
  try { return new Date(raw).toLocaleDateString('pt-BR'); } catch { return str(raw); }
};

export default function DishDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { userId, recipes, loading, favoritos, toggleFavorito, getComentarios, enviarComentario } = useAuth();

  const [servings, setServings] = useState(1);
  const [rating, setRating] = useState(0);
  const [sending, setSending] = useState(false);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [jaAvaliou, setJaAvaliou] = useState(false);

  const recipe = recipes.find(r => String(r.codReceitas ?? r.id) === String(id));
  const fav = favoritos.find(f => String(f.receita?.codReceitas) === String(id));
  const favoritoId = fav ? String(fav.codFavoritos) : null;

  useEffect(() => {
    if (!userId && !loading) router.push('/login');
  }, [loading]);

  useEffect(() => {
    getComentarios(String(id)).then((listaComentarios: any[]) => {
      setComentarios(listaComentarios);
      if (userId && Array.isArray(listaComentarios)) {
        const usuarioJaAvaliou = listaComentarios.some(
          c => String(String(c.usuario.codUser)) === String(userId)
        );
        setJaAvaliou(usuarioJaAvaliou);
      }
    });
  }, [id, userId]);

  const handleToggleFavorito = async () => {
    await toggleFavorito(String(id), Number(id));
  };

  const handleEnviarAvaliacao = async () => {
    if (!userId) { Alert.alert('Atenção', 'Você precisa estar logado para avaliar.'); return; }
    if (rating === 0) { Alert.alert('Atenção', 'Selecione uma nota de 1 a 5.'); return; }
    setSending(true);
    await enviarComentario(Number(id), rating);
    setSending(false);
    
    const atualizados = await getComentarios(String(id));
    setComentarios(atualizados);
    setJaAvaliou(true);
    
    Alert.alert('Obrigado!', 'Avaliação enviada com sucesso.');
    setRating(0);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: { position: 'absolute', top: 50, left: 20, right: 20, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between' },
    headerBtn: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
    image: { width: '100%', height: 300, backgroundColor: C.surfaceHi },
    content: { padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, backgroundColor: C.bg },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
    title: { fontSize: 26, fontWeight: 'bold', color: C.textPrimary, flex: 1, marginRight: 10 },
    chef: { fontSize: 16, color: C.textSub, marginBottom: 15 },
    descricao: { color: C.textSub, marginBottom: 10, fontSize: 15, lineHeight: 22 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: C.textPrimary, marginTop: 20, marginBottom: 15 },
    servingSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, padding: 10, borderRadius: 15, alignSelf: 'flex-start', marginBottom: 10, borderWidth: 0.5, borderColor: C.accentBorder },
    servingBtn: { padding: 5 },
    servingText: { marginHorizontal: 15, fontSize: 16, fontWeight: 'bold', color: C.textPrimary },
    ingredientItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    ingredientBullet: { fontSize: 15, color: C.hero, fontWeight: 'bold', marginRight: 8, lineHeight: 22 },
    ingredientText: { flex: 1, color: C.textPrimary, fontSize: 15, lineHeight: 22 },
    stepItem: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
    stepNumber: { minWidth: 28, height: 28, borderRadius: 14, backgroundColor: C.hero, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 1 },
    stepNumberText: { color: C.textOnHero, fontWeight: 'bold', fontSize: 13 },
    stepText: { flex: 1, color: C.textPrimary, fontSize: 15, lineHeight: 24 },
    ratingBox: { backgroundColor: C.surface, padding: 20, borderRadius: 20, marginTop: 20, borderWidth: 0.5, borderColor: C.accentBorder },
    starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
    sendBtn: { backgroundColor: C.hero, padding: 15, borderRadius: 12, alignItems: 'center' },
    sendBtnDisabled: { backgroundColor: C.surfaceHi, opacity: 0.7 },
    sendBtnText: { color: C.textOnHero, fontWeight: 'bold' },
    alreadyEvaluatedText: { color: C.textSub, fontSize: 16, textAlign: 'center', fontWeight: 'bold' },
    commentItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.accentBorder },
    commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    commentUser: { fontWeight: 'bold', color: C.textPrimary, fontSize: 14 },
    commentDate: { fontSize: 12, color: C.textMuted },
    commentText: { color: C.textSub, fontSize: 14, lineHeight: 20 },
  });

  if (!recipe) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: C.textPrimary }}>Receita não encontrada.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: C.hero }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const nomeReceita = str(recipe.nomeReceita ?? recipe.name);
  const nomeChefe = str(recipe.usuario?.nome_completo);
  const descricao = str(recipe.descricao);
  const fotoReceita = str(recipe.fotoReceita ?? recipe.image);
  const ingredientes = parseIngredientes(recipe.ingredientes);
  const passos = parsePassos(recipe.modo_preparo);

  const scaledIngredients = ingredientes.map(ing => {
    const qty = parseFloat(ing.quantidade);
    const scaled = isNaN(qty)
      ? ing.quantidade
      : (qty * servings) % 1 === 0 ? String(qty * servings) : (qty * servings).toFixed(1);
    return { quantidade: scaled, unidade: ing.unidade, nome: ing.nome };
  });

  function StarsDisplay({ nota }: { nota: number }) {
    return (
      <View style={{ flexDirection: 'row', gap: 1 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <Ionicons
            key={n}
            name={n <= nota ? 'star' : 'star-outline'}
            size={13}
            color={n <= nota ? '#FFD700' : C.textMuted}
          />
        ))}
      </View>
    );
  }

  return (
    loading ? (
      <BolinhaqGira />
    ) :
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {fotoReceita ? (
            <Image source={{ uri: fotoReceita }} style={styles.image} />
          ) : (
            <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="image-outline" size={48} color={C.textMuted} />
            </View>
          )}

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{nomeReceita}</Text>
              <TouchableOpacity onPress={handleToggleFavorito} style={{ paddingTop: 4 }}>
                <Ionicons
                  name={favoritoId ? 'heart' : 'heart-outline'}
                  size={28}
                  color={favoritoId ? C.heartActive : C.heartInactive}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.chef}>por {nomeChefe}</Text>
            {descricao ? <Text style={styles.descricao}>{descricao}</Text> : null}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>Ingredientes</Text>
              <View style={styles.servingSelector}>
                <TouchableOpacity onPress={() => setServings(Math.max(1, servings - 1))} style={styles.servingBtn}>
                  <Ionicons name="remove" size={20} color={C.accent} />
                </TouchableOpacity>
                <Text style={styles.servingText}>{servings} {servings === 1 ? 'pessoa' : 'pessoas'}</Text>
                <TouchableOpacity onPress={() => setServings(Math.min(10, servings + 1))} style={styles.servingBtn}>
                  <Ionicons name="add" size={20} color={C.accent} />
                </TouchableOpacity>
              </View>
            </View>

            {scaledIngredients.map((item, i) => (
              <View key={i} style={styles.ingredientItem}>
                <Text style={styles.ingredientBullet}>•</Text>
                <Text style={styles.ingredientText}>{item.quantidade} {item.unidade} {item.nome}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Modo de Preparo</Text>
            {passos.map((step, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Avalie esta receita</Text>
            <View style={styles.ratingBox}>
              {jaAvaliou ? (
                <Text style={styles.alreadyEvaluatedText}>Já avaliou essa receita</Text>
              ) : (
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                  <Text style={{ color: C.textPrimary, textAlign: 'center', marginBottom: 10, fontWeight: 'bold' }}>O que achou?</Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <TouchableOpacity key={s} onPress={() => setRating(s)}>
                        <Ionicons name={s <= rating ? 'star' : 'star-outline'} size={32} color={s <= rating ? '#FFD700' : C.textMuted} style={{ marginHorizontal: 5 }} />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[styles.sendBtn, (rating === 0 || sending) && styles.sendBtnDisabled]}
                    onPress={handleEnviarAvaliacao}
                    disabled={rating === 0 || sending}
                  >
                    {sending ? <ActivityIndicator color={C.white} /> : <Text style={styles.sendBtnText}>Enviar Avaliação</Text>}
                  </TouchableOpacity>
                </KeyboardAvoidingView>
              )}
            </View>

            <Text style={styles.sectionTitle}>Avaliações</Text>
            {comentarios.length === 0 ? (
              <Text style={{ color: C.textMuted, marginBottom: 20 }}>Nenhuma avaliação ainda. Seja o primeiro!</Text>
            ) : (
              comentarios.map((c, i) => (
                <View key={i} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.commentUser}>{str(c.usuario?.nome_completo ?? c.usuario?.nome_de_usuario)}</Text>
                      <StarsDisplay nota={Number(c.nota)} />
                    </View>
                    <Text style={styles.commentDate}>{formatDate(c.data_Comentario)}</Text>
                  </View>
                  {c.texto ? <Text style={styles.commentText}>{str(c.texto)}</Text> : null}
                </View>
              ))
            )}

            <View style={{ height: 50 }} />
          </View>
        </ScrollView>
      </View>
  );
}