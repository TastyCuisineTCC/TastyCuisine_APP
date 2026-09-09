import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
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
import BolinhaqGira from '../../components/BolinhaqGira';
import BottomNavigation from '../../components/BottomNavigation';
import { useAuth } from '../authContext';
import { C } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 20 * 2 - 12) / 2;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getRecipeName = (r: any) => r.nomeReceita ?? r.name ?? '';
const getRecipeChef = (r: any) => r.nome_completo ?? r.usuario?.nome_completo ?? r.chefe?.nomeCompleto ?? r.chef ?? 'Anônimo';
const getRecipeImage = (r: any) => r.fotoReceita || 'https://worldfoodtour.co.uk/wp-content/uploads/2013/06/neptune-placeholder-48.jpg';
const getRecipeTime = (r: any) => r.prepareTime ?? r.tempoPreparo ?? '15 min';
const getRecipeId = (r: any) => Number(r.codReceitas ?? r.id ?? 0);

// Componente para renderizar o Card de Receita com avaliação dinâmica
function SearchRecipeCard({ item, onPress }: { item: any; onPress: () => void }) {
  const { getMediaReceita, favoritos, toggleFavorito } = useAuth();
  const [rating, setRating] = useState<string>('...');

  const recipeId = getRecipeId(item);
  const isFav = favoritos.some((f: any) => String(f.receita?.codReceitas ?? f.codReceitas) === String(recipeId));

  useEffect(() => {
    let isMounted = true;
    async function fetchRating() {
      if (recipeId > 0) {
        const data = await getMediaReceita(recipeId);
        if (isMounted) {
          const media = data?.mediaNota ?? 0;
          setRating(media > 0 ? media.toFixed(1) : '0.0');
        }
      }
    }
    fetchRating();
    return () => { isMounted = false; };
  }, [item]);

  const handleLike = async () => {
    await toggleFavorito(String(recipeId), recipeId);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: getRecipeImage(item) }} style={styles.cardImg} resizeMode="cover" />
      <View style={styles.ratingPill}>
        <Ionicons name="star" size={10} color="#FFD700" />
        <Text style={styles.ratingText}>{rating}</Text>
      </View>

      <TouchableOpacity style={styles.heartPill} onPress={handleLike} activeOpacity={0.7}>
        <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={16} color={C.heartActive} />
      </TouchableOpacity>

      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={2}>{getRecipeName(item)}</Text>
        <Text style={styles.cardChef} numberOfLines={1}>por {getRecipeChef(item)}</Text>
        <View style={styles.timePill}>
          <Ionicons name="time-outline" size={11} color={C.textSub} />
          <Text style={styles.timeText}>{getRecipeTime(item)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const { recipes, loading, userId } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]);

  useEffect(() => {
    if (!userId && !loading) {
      router.push('/login');
      return;
    }

    if (!recipes) return;

    // Filtra receitas e chefs inativos/bloqueados
    const activeRecipes = recipes.filter((r) => {
      const statusReceita = String(r.status_Receita ?? r.status ?? '').toUpperCase();
      const statusUsuario = String(r.usuario?.statusUsuario ?? r.usuario?.status ?? '').toUpperCase();

      return statusReceita !== 'INATIVADO' && statusReceita !== 'BLOQUEADO' &&
             statusUsuario !== 'INATIVADO' && statusUsuario !== 'BLOQUEADO';
    });

    if (searchQuery.trim() === '') {
      setFilteredRecipes(activeRecipes);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const results = activeRecipes.filter(r => {
        const title = getRecipeName(r).toLowerCase();
        const chef = getRecipeChef(r).toLowerCase();
        const category = String(r.categoria ?? r.category ?? '').toLowerCase();
        
        return title.includes(query) || chef.includes(query) || category.includes(query);
      });
      setFilteredRecipes(results);
    }
  }, [searchQuery, recipes, loading, userId]);

  const handlePressDish = (id: number) => {
    router.push({ pathname: '/Sobpo/[id]', params: { id: String(id) } });
  };

  if (loading) return <BolinhaqGira />;

  const gridPairs: any[][] = [];
  for (let i = 0; i < filteredRecipes.length; i += 2) {
    gridPairs.push(filteredRecipes.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <Text style={styles.title}>Pesquisar</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={C.textSub} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por receita, chef ou categoria..."
            placeholderTextColor={C.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={C.textSub} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.resultsCount}>
          {filteredRecipes.length} {filteredRecipes.length === 1 ? 'receita encontrada' : 'receitas encontradas'}
        </Text>

        {filteredRecipes.length > 0 ? (
          <View style={styles.gridContainer}>
            {gridPairs.map((pair, i) => (
              <View key={i} style={styles.row}>
                {pair.map(item => {
                  const rId = getRecipeId(item);
                  return (
                    <SearchRecipeCard
                      key={rId}
                      item={item}
                      onPress={() => handlePressDish(rId)}
                    />
                  );
                })}
                {pair.length === 1 && <View style={{ width: CARD_WIDTH }} />}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={C.textMuted} />
            <Text style={styles.emptyTitle}>Nenhuma receita encontrada</Text>
            <Text style={styles.emptySub}>Tente buscar por outro termo ou ingrediente.</Text>
          </View>
        )}
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: C.textPrimary, marginBottom: 12 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 0.5,
    borderColor: '#EDE0D4',
    elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.textPrimary },
  resultsCount: { fontSize: 12, color: C.textSub, fontWeight: '600', marginBottom: 16 },
  gridContainer: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: C.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#EDE0D4',
    elevation: 3,
  },
  cardImg: { width: '100%', height: 120, backgroundColor: C.surfaceHi },
  ratingPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heartPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 5,
    borderRadius: 20,
  },
  ratingText: { color: C.white, fontSize: 11, fontWeight: '700' },
  cardInfo: { padding: 12, gap: 3 },
  cardName: { fontSize: 14, fontWeight: '700', color: C.textPrimary, lineHeight: 19 },
  cardChef: { fontSize: 11, color: C.textSub },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  timeText: { fontSize: 11, color: C.textSub, fontWeight: '600' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  emptySub: { fontSize: 13, color: C.textSub, textAlign: 'center' },
});