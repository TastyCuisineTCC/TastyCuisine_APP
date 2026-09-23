import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BolinhaqGira from '../../components/BolinhaqGira';
import BottomNavigation from '../../components/BottomNavigation';
import { useAuth } from '../authContext';
import { C } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 20 * 2 - 12) / 2;

// Ícones padrão para mapear dinamicamente caso queira dar um toque visual legal
const CATEGORY_ICONS: Record<string, string> = {
  'Massas': 'nutrition-outline',
  'Sobremesas': 'ice-cream-outline',
  'Lanches e Petiscos': 'pizza-outline',
  'Sopas e Caldos': 'water-outline',
  'Saladas': 'leaf-outline',
  'Carnes': 'restaurant-outline',
  'Aves': 'restaurant-outline',
  'Peixes e Frutos do Mar': 'fish-outline',
  'Vegetariana': 'leaf-outline',
  'Vegana': 'leaf-outline',
  'Bebidas e Drinks': 'wine-outline',
  'Café da Manhã': 'cafe-outline',
  'Pães e Bolos': 'basket-outline',
  'Fitness e Saudável': 'fitness-outline',
  'Molhos e Acompanhamentos': 'layers-outline',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getRecipeName   = (r: any) => r.nomeReceita ?? r.name ?? '';
const getRecipeChef   = (r: any) => r.usuario?.nome_completo ?? r.chefe?.nomeCompleto ?? r.chef ?? 'Anônimo';
const getRecipeImage  = (r: any) => r.fotoReceita || 'https://worldfoodtour.co.uk/wp-content/uploads/2013/06/neptune-placeholder-48.jpg';
const getRecipeTime   = (r: any) => r.tempoPreparo ?? r.prepareTime ?? '15 min';
const getRecipeId     = (r: any) => Number(r.codReceitas ?? r.id ?? 0);

// ─── Grid card (2 colunas) ───────────────────────────────────────────────────
function GridCard({ item, onPress }: { item: any; onPress: () => void }) {
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
    <TouchableOpacity style={g.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: getRecipeImage(item) }} style={g.img} resizeMode="cover" />
      <View style={g.ratingPill}>
        <Ionicons name="star" size={10} color="#FFD700" />
        <Text style={g.ratingText}>{rating}</Text>
      </View>
      <TouchableOpacity style={g.heartPill} onPress={handleLike} activeOpacity={0.7}>
        <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={16} color={C.heartActive} />
      </TouchableOpacity>
      <View style={g.info}>
        <Text style={g.name} numberOfLines={2}>{getRecipeName(item)}</Text>
        <Text style={g.chef} numberOfLines={1}>por {getRecipeChef(item)}</Text>
        <View style={g.timePill}>
          <Ionicons name="time-outline" size={11} color={C.textSub} />
          <Text style={g.timeText}>{getRecipeTime(item)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Wide card (1 coluna, horizontal) ────────────────────────────────────────
function WideCard({ item, onPress }: { item: any; onPress: () => void }) {
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
    <TouchableOpacity style={w.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: getRecipeImage(item) }} style={w.img} resizeMode="cover" />
      <View style={w.info}>
        <Text style={w.name} numberOfLines={2}>{getRecipeName(item)}</Text>
        <Text style={w.chef} numberOfLines={1}>por {getRecipeChef(item)}</Text>
        <View style={w.row}>
          <View style={w.pill}>
            <Ionicons name="time-outline" size={11} color={C.textSub} />
            <Text style={w.pillText}>{getRecipeTime(item)}</Text>
          </View>
          <View style={[w.pill, { backgroundColor: '#FFF8E8' }]}>
            <Ionicons name="star" size={11} color="#FFD700" />
            <Text style={w.pillText}>{rating}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={w.heartBtn} onPress={handleLike} activeOpacity={0.7}>
        <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={C.heartActive} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { userName, userId, recipes, loading, getMediaReceita, favoritos, toggleFavorito } = useAuth();
  const router = useRouter();

  const [categories, setCategories]         = useState<any[]>([]);
  const [activeIndex, setActiveIndex]       = useState(0);
  const [activeCategory, setActiveCategory] = useState<number | 'todos'>('todos');
  const [carouselRating, setCarouselRating] = useState<string>('...');

  // Buscar categorias da API
  useEffect(() => {
    let isMounted = true;
    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:8080/categoria/findAll');
        const data = await response.json();
        if (isMounted && Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Erro ao buscar categorias da API:', error);
      }
    }
    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!userId && !loading) router.push('/login');
  }, [loading]);

  const featuredRecipes = recipes.slice(0, 5);

  useEffect(() => {
    let isMounted = true;
    async function fetchCarouselRating() {
      if (featuredRecipes.length > 0) {
        const item = featuredRecipes[activeIndex];
        const id = getRecipeId(item);
        if (id > 0) {
          const data = await getMediaReceita(id);
          if (isMounted) {
            const media = data?.mediaNota ?? 0;
            setCarouselRating(media > 0 ? media.toFixed(1) : '0.0');
          }
        }
      }
    }
    fetchCarouselRating();
    return () => { isMounted = false; };
  }, [activeIndex, recipes]);

  const quickRecipes = recipes.filter(r => {
    const timeStr = (r.tempoPreparo ?? r.prepareTime ?? '').toString().toLowerCase();
    if (timeStr.includes('rápido') || timeStr.includes('rapido')) return true;
    const min = parseInt(timeStr.replace(/\D/g, ''), 10);
    return !isNaN(min) && min <= 30;
  });

  // Filtragem ajustada utilizando o array de categorias da receita e o ID da categoria selecionada
  const filteredRecipes = activeCategory === 'todos'
    ? recipes
    : recipes.filter(r => {
        if (!r.categoria || !Array.isArray(r.categoria)) return false;
        return r.categoria.some((cat: any) => Number(cat.codCategoria) === Number(activeCategory));
      });

  const handlePressDish = (id: string | number) =>
    router.push({ pathname: '/Sobpo/[id]', params: { id: String(id) } });

  if (loading) return <BolinhaqGira />;

  const gridPairs: any[][] = [];
  for (let i = 0; i < filteredRecipes.length; i += 2) {
    gridPairs.push(filteredRecipes.slice(i, i + 2));
  }

  const activeFeatured = featuredRecipes[activeIndex];
  const activeFeaturedId = activeFeatured ? getRecipeId(activeFeatured) : 0;
  const isFeaturedFav = favoritos.some((f: any) => String(f.receita?.codReceitas ?? f.codReceitas) === String(activeFeaturedId));

  const activeCategoryName = activeCategory === 'todos'
    ? 'Para você'
    : categories.find(c => Number(c.codCategoria) === Number(activeCategory))?.nomeCategoria ?? 'Receitas';

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Olá, {(userName || 'Gourmet').split(' ')[0]} </Text>
          <Text style={s.subtitle}>O que vamos cozinhar hoje?</Text>
        </View>
        <View style={s.avatarCircle}>
          <TouchableOpacity style={w.perfil} onPress={() => router.push('/profile')}>         
             <Text style={s.avatarInitial}>{(userName || 'G').charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        <View style={s.sectionHeaderRow}>
          <Text style={s.eyebrow}>DESTAQUES DA SEMANA</Text>
          <View style={s.badge}>
            <Ionicons name="star" size={11} color={C.hero} />
            <Text style={s.badgeText}>Mais bem avaliadas</Text>
          </View>
        </View>

        {featuredRecipes.length > 0 && (
          <View style={{ paddingHorizontal: 20 }}>
            <TouchableOpacity
              style={s.carouselCard}
              onPress={() => handlePressDish(getRecipeId(featuredRecipes[activeIndex]))}
              activeOpacity={0.92}
            >
              <Image
                source={{ uri: getRecipeImage(featuredRecipes[activeIndex]) }}
                style={s.carouselImage}
                resizeMode="cover"
              />
              <View style={s.carouselGradient} />
              <View style={s.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={s.ratingBadgeText}>{carouselRating}</Text>
              </View>
              <TouchableOpacity
                style={s.carouselHeartBadge}
                onPress={() => toggleFavorito(String(activeFeaturedId), activeFeaturedId)}
                activeOpacity={0.7}
              >
                <Ionicons name={isFeaturedFav ? 'heart' : 'heart-outline'} size={18} color={C.heartActive} />
              </TouchableOpacity>
              <View style={s.carouselInfo}>
                <Text style={s.carouselTitle} numberOfLines={2}>
                  {getRecipeName(featuredRecipes[activeIndex])}
                </Text>
                <View style={s.carouselMeta}>
                  <View style={s.carouselMetaItem}>
                    <Ionicons name="person-outline" size={13} color="rgba(255,230,200,0.85)" />
                    <Text style={s.carouselMetaText}>{getRecipeChef(featuredRecipes[activeIndex])}</Text>
                  </View>
                  <View style={s.carouselMetaItem}>
                    <Ionicons name="time-outline" size={13} color="rgba(255,230,200,0.85)" />
                    <Text style={s.carouselMetaText}>{getRecipeTime(featuredRecipes[activeIndex])}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <View style={s.carouselControls}>
              <TouchableOpacity style={s.navBtn} onPress={() => setActiveIndex(Math.max(0, activeIndex - 1))} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={18} color={C.hero} />
              </TouchableOpacity>
              <View style={s.dotsRow}>
                {featuredRecipes.map((_, i) => (
                  <TouchableOpacity key={i} onPress={() => setActiveIndex(i)}>
                    <View style={[s.dot, i === activeIndex && s.dotActive]} />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={s.navBtn} onPress={() => setActiveIndex(Math.min(featuredRecipes.length - 1, activeIndex + 1))} activeOpacity={0.7}>
                <Ionicons name="chevron-forward" size={18} color={C.hero} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={[s.eyebrow, { paddingHorizontal: 20, marginTop: 28, marginBottom: 12 }]}>CATEGORIAS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {/* Opção "Todos" */}
          <TouchableOpacity
            style={[s.chip, activeCategory === 'todos' && s.chipActive]}
            onPress={() => setActiveCategory('todos')}
            activeOpacity={0.75}
          >
            <Ionicons name="restaurant-outline" size={14} color={activeCategory === 'todos' ? C.white : C.accent} />
            <Text style={[s.chipText, activeCategory === 'todos' && s.chipTextActive]}>Todos</Text>
          </TouchableOpacity>

          {/* Categorias vindas da API */}
          {categories.map(cat => {
            const active = activeCategory === cat.codCategoria;
            const iconName = CATEGORY_ICONS[cat.nomeCategoria] || 'restaurant-outline';
            return (
              <TouchableOpacity
                key={cat.codCategoria}
                style={[s.chip, active && s.chipActive]}
                onPress={() => setActiveCategory(cat.codCategoria)}
                activeOpacity={0.75}
              >
                <Ionicons name={iconName as any} size={14} color={active ? C.white : C.accent} />
                <Text style={[s.chipText, active && s.chipTextActive]}>{cat.nomeCategoria}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={s.sectionHeaderRow2}>
          <Text style={s.sectionTitle}>{activeCategoryName}</Text>
          <Text style={s.recipeCount}>{filteredRecipes.length} receitas</Text>
        </View>

        {filteredRecipes.length > 0 ? (
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            {gridPairs.map((pair, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                {pair.map(item => (
                  <GridCard
                    key={getRecipeId(item)}
                    item={item}
                    onPress={() => handlePressDish(getRecipeId(item))}
                  />
                ))}
                {pair.length === 1 && <View style={{ width: CARD_WIDTH }} />}
              </View>
            ))}
          </View>
        ) : (
          <View style={s.emptyState}>
            <Ionicons name="search-outline" size={36} color={C.textMuted} />
            <Text style={s.emptyText}>Nenhuma receita nessa categoria ainda</Text>
          </View>
        )}

        {activeCategory === 'todos' && quickRecipes.length > 0 && (
          <>
            <View style={s.sectionHeaderRow2}>
              <Text style={s.sectionTitle}>Rápidas de fazer</Text>
              <View style={s.badge}>
                <Ionicons name="flash-outline" size={11} color={C.hero} />
                <Text style={s.badgeText}>até 30 min</Text>
              </View>
            </View>
            <View style={{ paddingHorizontal: 20, gap: 10 }}>
              {quickRecipes.slice(0, 5).map(item => (
                <WideCard
                  key={getRecipeId(item)}
                  item={item}
                  onPress={() => handlePressDish(getRecipeId(item))}
                />
              ))}
            </View>
          </>
        )}

      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const g = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: C.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#EDE0D4',
    shadowColor: '#3D2010',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  img:        { width: '100%', height: 120, backgroundColor: C.surfaceHi },
  ratingPill: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  heartPill: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 5, borderRadius: 20,
  },
  ratingText: { color: C.white, fontSize: 11, fontWeight: '700' },
  info:       { padding: 12, gap: 3 },
  name:       { fontSize: 14, fontWeight: '700', color: C.textPrimary, lineHeight: 19 },
  chef:       { fontSize: 11, color: C.textSub },
  timePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.accentSoft,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10, alignSelf: 'flex-start', marginTop: 4,
  },
  timeText: { fontSize: 11, color: C.textSub, fontWeight: '600' },
});

const w = StyleSheet.create({
  perfil:{
    opacity: 100,
    backgroundColor: 'transparent',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#EDE0D4',
    shadowColor: '#3D2010',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    alignItems: 'center',
  },
  img:   { width: 90, height: 90, backgroundColor: C.surfaceHi, borderRadius: 10, marginLeft: 5 },
  info:  { flex: 1, padding: 14, gap: 4 },
  name:  { fontSize: 15, fontWeight: '700', color: C.textPrimary, lineHeight: 20 },
  chef:  { fontSize: 12, color: C.textSub },
  row:   { flexDirection: 'row', gap: 8, marginTop: 4 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.accentSoft,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  pillText: { fontSize: 11, color: C.textSub, fontWeight: '600' },
  heartBtn: { paddingRight: 14, paddingLeft: 4 },
});

const s = StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 100 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 12,
    paddingBottom: 20,
    backgroundColor: C.bg,
  },
  greeting:      { fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 2 },
  subtitle:      { fontSize: 14, color: C.textSub, fontWeight: '500' },
  avatarCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: C.hero, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.hero, shadowOpacity: 0.35, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 5,
  },
  avatarInitial: { color: C.white, fontSize: 18, fontWeight: '800' },

  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2.5, color: C.textSub },

  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 14, marginTop: 4,
  },
  sectionHeaderRow2: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: 20, marginTop: 28, marginBottom: 14,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: C.textPrimary },
  recipeCount:  { fontSize: 12, color: C.textMuted, fontWeight: '600' },

  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.accentSoft,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 0.5, borderColor: C.accentBorder,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: C.hero },

  carouselCard: {
    width: '100%', height: 240, borderRadius: 22, overflow: 'hidden',
    backgroundColor: C.surfaceHi,
    shadowColor: '#3D2010', shadowOpacity: 0.18, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  carouselImage:    { width: '100%', height: '100%', position: 'absolute' },
  carouselGradient: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%',
    backgroundColor: 'rgba(61,32,16,0.72)',
  },
  ratingBadge: {
    position: 'absolute', top: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  carouselHeartBadge: {
    position: 'absolute', top: 14, left: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 6, borderRadius: 20,
  },
  ratingBadgeText: { color: C.white, fontSize: 12, fontWeight: '700' },
  carouselInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18 },
  carouselTitle: { fontSize: 22, fontWeight: '800', color: C.white, marginBottom: 8, lineHeight: 28 },
  carouselMeta:     { flexDirection: 'row', gap: 16 },
  carouselMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  carouselMetaText: { fontSize: 12, color: 'rgba(255,230,200,0.85)', fontWeight: '500' },

  carouselControls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 14, paddingHorizontal: 4,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: C.accentBorder,
  },
  dotsRow:  { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot:      { width: 7, height: 7, borderRadius: 4, backgroundColor: C.accentBorder },
  dotActive:{ width: 22, height: 7, borderRadius: 4, backgroundColor: C.hero },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.accentSoft, paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 22, borderWidth: 0.5, borderColor: C.accentBorder,
  },
  chipActive: {
    backgroundColor: C.hero, borderColor: C.hero,
    shadowColor: C.hero, shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  chipText:       { fontSize: 13, fontWeight: '600', color: C.accent },
  chipTextActive: { color: C.white },

  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText:  { color: C.textMuted, fontSize: 14, fontWeight: '500' },
});