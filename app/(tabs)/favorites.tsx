/**
 * FavoritesScreen.tsx
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
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
import BolinhaqGira from '../../components/BolinhaqGira';
import BottomNavigation from '../../components/BottomNavigation';
import { Livro, useAuth } from '../authContext';
import { useTheme } from '../themeContext';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg:           '#F5EDE3',
  surface:      '#FFFFFF',
  surfaceHi:    '#F0E6DA',
  hero:         '#C4703A',
  accent:       '#C4703A',
  accentSoft:   '#FFF0E8',
  accentBorder: '#F0C8A0',
  textPrimary:  '#3D2010',
  textSub:      '#B8906A',
  textMuted:    '#D4B89A',
  white:        '#FFFFFF',
  dashedBorder: '#F0C8A0',
  disabledBg:   '#E2E8F0',
  disabledText: '#64748B',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - 20 * 2 - 14) / 2; // 2 colunas, gap 14

// ─── Helpers de favorito ──────────────────────────────────────────────────────
const getFavName     = (f: any): string => f.receita?.nomeReceita ?? f.nomeReceita ?? '';
const getFavChef     = (f: any): string => f.receita?.usuario?.nome_completo ?? f.usuario?.nome_completo ?? f.chefe?.nomeCompleto ?? '';
const getFavImage    = (f: any): string => f.receita?.fotoReceita ?? f.fotoReceita ?? '';
const getFavRecipeId = (f: any): string => String(f.receita?.codReceitas ?? f.codReceitas ?? '');
const getFavId       = (f: any): string => String(f.codFavoritos ?? f.codReceitas ?? '');

// Verifica se a receita ou seu autor está inativo / bloqueado
const isRecipeIndisponivel = (item: any): boolean => {
  const rec = item.receita || item;
  console.log(item)
  const statusReceita = String(rec?.status_receita ?? rec?.status ?? '').toUpperCase();
  const statusUsuario = String(rec?.usuario?.status_Usuario ?? rec?.usuario?.status ?? '').toUpperCase();

  return (
    statusReceita === 'INATIVO' ||
    statusReceita === 'BLOQUEADO' ||
    statusUsuario === 'INATIVO' ||
    statusUsuario === 'BLOQUEADO'
  );
};

const PLACEHOLDER = 'https://worldfoodtour.co.uk/wp-content/uploads/2013/06/neptune-placeholder-48.jpg';

export default function FavoritesScreen() {
  const { theme, isDarkMode } = useTheme();
  const {
    loading,
    userId,
    favoritos,
    createBook,
    deleteBook,
    getBookbyUserId,
    addRecipeToBook,
    removeRecipeFromBook,
  } = useAuth();
  const router = useRouter();

  // ── Estado dos livros ──────────────────────────────────────────────────────
  const [books, setBooks]                     = useState<Livro[]>([]);
  const [booksLoaded, setBooksLoaded]         = useState(false);

  // ── Estado da busca ────────────────────────────────────────────────────────
  const [searchVisible, setSearchVisible]     = useState(false);
  const [searchQuery, setSearchQuery]         = useState('');

  // ── Modais ─────────────────────────────────────────────────────────────────
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible]       = useState(false);
  const [bookDetailVisible, setBookDetailVisible]   = useState(false);

  // ── Dados temporários ──────────────────────────────────────────────────────
  const [newBookName, setNewBookName]         = useState('');
  const [selectedBook, setSelectedBook]       = useState<Livro | null>(null);
  const [selectedFavIds, setSelectedFavIds]   = useState<string[]>([]);

  // ── Animação do botão "+" ──────────────────────────────────────────────────
  const plusScale = useRef(new Animated.Value(1)).current;
  const animatePlus = () => {
    Animated.sequence([
      Animated.timing(plusScale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(plusScale,  { toValue: 1,    useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (!userId && !loading) router.push('/login');
  }, [loading]);

  // Carregar os livros
  useEffect(() => {
    async function loadBooks() {
      if (!userId) return;

      const result = await getBookbyUserId(Number(userId));

      if (result.ok && result.livros) {
        setBooks(result.livros);
      }

      setBooksLoaded(true);
    }

    loadBooks();
  }, [userId]);

  // ── Criar livro ───────────────────────────────────────────────────────────
  const handleCreateBook = async () => {
    const name = newBookName.trim();
    if (!name) return;

    const result = await createBook(name);

    if (result.ok && userId) {
      const livros = await getBookbyUserId(Number(userId));
      if (livros.ok && livros.livros) {
        setBooks(livros.livros);
      }
      setCreateModalVisible(false);
      setNewBookName('');
    }
  };

  // ── Abrir modal de adicionar receitas a um livro ──────────────────────────
  const openAddModal = (book: Livro) => {
    setSelectedBook(book);
    setSelectedFavIds(
      book.receitas.map(r => String(r.codReceitas))
    );
    setAddModalVisible(true);
  };

  // ── Salvar receitas no livro ──────────────────────────────────────────────
  const handleSaveRecipes = async () => {
    if (!selectedBook) return;

    const receitasAtuais = selectedBook.receitas.map(r => String(r.codReceitas));

    const paraAdicionar = selectedFavIds.filter(id => !receitasAtuais.includes(id));
    const paraRemover = receitasAtuais.filter(id => !selectedFavIds.includes(id));

    for (const receitaId of paraAdicionar) {
      await addRecipeToBook(selectedBook.codLivro, Number(receitaId));
    }

    for (const receitaId of paraRemover) {
      await removeRecipeFromBook(selectedBook.codLivro, Number(receitaId));
    }

    if (userId) {
      const result = await getBookbyUserId(Number(userId));
      if (result.ok && result.livros) {
        setBooks(result.livros);
      }
    }

    setAddModalVisible(false);
    setSelectedBook(null);
  };

  // ── Excluir livro ─────────────────────────────────────────────────────────
  const handleDeleteBook = async (bookId: number) => {
    const result = await deleteBook(bookId);

    if (result.ok) {
      setBooks(prev => prev.filter(book => book.codLivro !== bookId));
      setBookDetailVisible(false);
    }
  };

  // ── Toggle receita na seleção ─────────────────────────────────────────────
  const toggleRecipeSelect = (recipeId: string) => {
    setSelectedFavIds(prev =>
      prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
    );
  };

  // ── Receitas de um livro (para tela de detalhe) ───────────────────────────
  const getBookRecipes = (book: Livro) => {
    return book.receitas || [];
  };

  // ── Livros filtrados pela busca ────────────────────────────────────────────
  const filteredBooks = searchQuery.trim()
    ? books.filter(b => b.nomeLivro.toLowerCase().includes(searchQuery.toLowerCase()))
    : books;

  const handleToggleSearch = () => {
    setSearchVisible(v => !v);
    setSearchQuery('');
  };

  if (loading || !booksLoaded) return <BolinhaqGira />;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Livro de Receitas</Text>
        <TouchableOpacity style={s.headerSearch} onPress={handleToggleSearch}>
          <Ionicons
            name={searchVisible ? 'close-outline' : 'search-outline'}
            size={22}
            color={C.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* ── BARRA DE BUSCA ── */}
      {searchVisible && (
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={18} color={C.hero} />
          <TextInput
            style={s.searchInput}
            placeholder="Buscar livro..."
            placeholderTextColor={C.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── GRID DE LIVROS ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.grid}
      >
        {filteredBooks.length === 0 && searchQuery.trim() !== '' && (
          <View style={s.emptySearch}>
            <Ionicons name="search-outline" size={40} color={C.textMuted} />
            <Text style={s.emptySearchText}>Nenhum livro encontrado</Text>
          </View>
        )}

        {filteredBooks.map(book => (
          <BookCard
            key={book.codLivro}
            book={book}
            count={book.receitas?.length ?? 0}
            onPress={() => { setSelectedBook(book); setBookDetailVisible(true); }}
            onLongPress={() => openAddModal(book)}
          />
        ))}

        {!searchQuery.trim() && (
          <Animated.View style={{ transform: [{ scale: plusScale }] }}>
            <TouchableOpacity
              style={bc.addCard}
              activeOpacity={0.8}
              onPress={() => { animatePlus(); setCreateModalVisible(true); }}
            >
              <View style={bc.addIconCircle}>
                <Ionicons name="add" size={28} color={C.hero} />
              </View>
              <Text style={bc.addLabel}>Adicionar novo{'\n'}livro</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      <BottomNavigation />

      {/* ════ MODAL: CRIAR LIVRO ════ */}
      <Modal visible={createModalVisible} transparent animationType="fade" onRequestClose={() => setCreateModalVisible(false)}>
        <View style={m.overlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setCreateModalVisible(false)} />
          <View style={m.sheet}>
            <Text style={m.sheetTitle}>Novo livro</Text>
            <TextInput
              style={m.input}
              placeholder="Nome do livro..."
              placeholderTextColor={C.textMuted}
              value={newBookName}
              onChangeText={setNewBookName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreateBook}
            />
            <View style={m.row}>
              <TouchableOpacity style={m.btnSecondary} onPress={() => { setCreateModalVisible(false); setNewBookName(''); }}>
                <Text style={m.btnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[m.btnPrimary, !newBookName.trim() && m.btnDisabled]}
                onPress={handleCreateBook}
                disabled={!newBookName.trim()}
              >
                <Text style={m.btnPrimaryText}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ════ MODAL: ADICIONAR RECEITAS AO LIVRO ════ */}
      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <View style={m.overlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setAddModalVisible(false)} />
          <View style={[m.sheet, { maxHeight: '75%' }]}>
            <Text style={m.sheetTitle}>Adicionar ao "{selectedBook?.nomeLivro}"</Text>
            <Text style={m.sheetSub}>Escolha entre seus favoritos</Text>

            {favoritos.length === 0 ? (
              <Text style={m.emptyText}>Você ainda não tem receitas favoritadas.</Text>
            ) : (
              <FlatList
                data={favoritos}
                keyExtractor={getFavId}
                style={{ marginTop: 12 }}
                contentContainerStyle={{ gap: 10, paddingBottom: 8 }}
                renderItem={({ item }) => {
                  const rid = getFavRecipeId(item);
                  const selected = selectedFavIds.includes(rid);
                  const indisponivel = isRecipeIndisponivel(item);

                  return (
                    <TouchableOpacity
                      style={[
                        m.recipeRow,
                        selected && m.recipeRowSelected,
                        indisponivel && { opacity: 0.6 }
                      ]}
                      onPress={() => toggleRecipeSelect(rid)}
                      activeOpacity={0.75}
                    >
                      <Image
                        source={{ uri: getFavImage(item) || PLACEHOLDER }}
                        style={m.recipeThumb}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={m.recipeName} numberOfLines={1}>{getFavName(item)}</Text>
                        <Text style={m.recipeChef} numberOfLines={1}>
                          {indisponivel ? 'Receita Indisponível' : `por ${getFavChef(item)}`}
                        </Text>
                      </View>
                      <View style={[m.checkbox, selected && m.checkboxSelected]}>
                        {selected && <Ionicons name="checkmark" size={14} color={C.white} />}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            <View style={[m.row, { marginTop: 16 }]}>
              <TouchableOpacity style={m.btnSecondary} onPress={() => setAddModalVisible(false)}>
                <Text style={m.btnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={m.btnPrimary} onPress={handleSaveRecipes}>
                <Text style={m.btnPrimaryText}>Salvar ({selectedFavIds.length})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ════ MODAL: DETALHE DO LIVRO ════ */}
      <Modal visible={bookDetailVisible} transparent animationType="slide" onRequestClose={() => setBookDetailVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
          <View style={d.header}>
            <TouchableOpacity onPress={() => setBookDetailVisible(false)} style={d.backBtn}>
              <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
            </TouchableOpacity>
            <Text style={d.title} numberOfLines={1}>{selectedBook?.nomeLivro}</Text>
            <View style={d.headerRight}>
              <TouchableOpacity
                style={d.iconBtn}
                onPress={() => { setBookDetailVisible(false); if (selectedBook) openAddModal(selectedBook); }}
              >
                <Ionicons name="add-circle-outline" size={24} color={C.hero} />
              </TouchableOpacity>
              <TouchableOpacity
                style={d.iconBtn}
                onPress={() => selectedBook && handleDeleteBook(selectedBook.codLivro)}
              >
                <Ionicons name="trash-outline" size={22} color="#D04040" />
              </TouchableOpacity>
            </View>
          </View>

          {selectedBook && getBookRecipes(selectedBook).length === 0 ? (
            <View style={d.empty}>
              <Ionicons name="book-outline" size={48} color={C.textMuted} />
              <Text style={d.emptyText}>Nenhuma receita ainda.</Text>
              <TouchableOpacity
                style={d.emptyBtn}
                onPress={() => { setBookDetailVisible(false); openAddModal(selectedBook); }}
              >
                <Text style={d.emptyBtnText}>Adicionar receitas</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={selectedBook ? getBookRecipes(selectedBook) : []}
              keyExtractor={getFavId}
              contentContainerStyle={d.list}
              renderItem={({ item }) => {
                const indisponivel = isRecipeIndisponivel(item);
                const recId = getFavRecipeId(item);

                if (indisponivel) {
                  return (
                    <View style={[d.card, d.cardDisabled]}>
                      <Image
                        source={{ uri: getFavImage(item) || PLACEHOLDER }}
                        style={[d.cardImg, d.imgDisabled]}
                      />
                      <View style={d.cardInfo}>
                        <Text style={[d.cardName, d.textDisabled]} numberOfLines={2}>
                          {getFavName(item)}
                        </Text>
                        <View style={d.badgeIndisponivel}>
                          <Ionicons name="alert-circle-outline" size={12} color={C.disabledText} />
                          <Text style={d.badgeIndisponivelText}>Receita indisponível</Text>
                        </View>
                      </View>
                      <Ionicons name="lock-closed-outline" size={18} color={C.disabledText} />
                    </View>
                  );
                }

                return (
                  <TouchableOpacity
                    style={d.card}
                    activeOpacity={0.85}
                    onPress={() => {
                      setBookDetailVisible(false);
                      router.push({ pathname: '/Sobpo/[id]', params: { id: recId } });
                    }}
                  >
                    <Image source={{ uri: getFavImage(item) || PLACEHOLDER }} style={d.cardImg} />
                    <View style={d.cardInfo}>
                      <Text style={d.cardName} numberOfLines={2}>{getFavName(item)}</Text>
                      <Text style={d.cardChef} numberOfLines={1}>por {getFavChef(item)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// BOOK CARD
function BookCard({
  book, count, onPress, onLongPress,
}: {
  book: Livro;
  count: number;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={bc.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
      delayLongPress={400}
    >
      <View style={bc.coverBox}>
        {book.fotoLivro ? (
          <Image source={{ uri: book.fotoLivro }} style={bc.coverImg} resizeMode="cover" />
        ) : (
          <View style={bc.coverPlaceholder}>
            <Ionicons name="book-outline" size={32} color={C.accentBorder} />
          </View>
        )}
        <View style={bc.countBadge}>
          <Text style={bc.countText}>{count}</Text>
        </View>
      </View>
      <View style={bc.info}>
        <Text style={bc.name} numberOfLines={2}>{book.nomeLivro}</Text>
        <Text style={bc.sub}>{count} {count === 1 ? 'receita' : 'receitas'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const bc = StyleSheet.create({
  card: {
    width: CARD_SIZE,
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
  coverBox:        { width: '100%', height: CARD_SIZE * 0.72, backgroundColor: C.surfaceHi },
  coverImg:        { width: '100%', height: '100%' },
  coverPlaceholder:{ flex: 1, alignItems: 'center', justifyContent: 'center' },
  countBadge: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: C.hero,
    borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3,
  },
  countText: { color: C.white, fontSize: 11, fontWeight: '800' },
  info:      { padding: 11, gap: 2 },
  name:      { fontSize: 14, fontWeight: '700', color: C.textPrimary, lineHeight: 19 },
  sub:       { fontSize: 11, color: C.textSub },

  addCard: {
    width: CARD_SIZE,
    height: CARD_SIZE * 0.72 + 54,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.dashedBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: C.accentSoft,
  },
  addIconCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.accentBorder,
    shadowColor: C.hero, shadowOpacity: 0.15,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  addLabel: { fontSize: 13, fontWeight: '600', color: C.textSub, textAlign: 'center', lineHeight: 18 },
});

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 12,
    paddingBottom: 16,
    backgroundColor: C.bg,
  },
  headerTitle:  { fontSize: 22, fontWeight: '800', color: C.textPrimary },
  headerSearch: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: '#EDE0D4',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.hero,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: C.textPrimary, padding: 0 },
  emptySearch: { width: '100%', alignItems: 'center', paddingTop: 48, gap: 12 },
  emptySearchText: { fontSize: 14, color: C.textMuted, fontWeight: '500' },
  grid: { paddingHorizontal: 20, paddingBottom: 110, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
  sheetSub:   { fontSize: 13, color: C.textSub, marginBottom: 4 },
  emptyText:  { fontSize: 14, color: C.textMuted, textAlign: 'center', marginVertical: 20 },
  input: {
    backgroundColor: C.bg,
    borderRadius: 14, borderWidth: 1, borderColor: C.accentBorder,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 16, color: C.textPrimary, marginVertical: 16,
  },
  row:           { flexDirection: 'row', gap: 12 },
  btnPrimary: {
    flex: 1, backgroundColor: C.hero,
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  btnPrimaryText: { color: C.white, fontWeight: '800', fontSize: 15 },
  btnSecondary: {
    flex: 1, backgroundColor: C.accentSoft,
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: C.accentBorder,
  },
  btnSecondaryText: { color: C.hero, fontWeight: '700', fontSize: 15 },
  btnDisabled:      { opacity: 0.45 },
  recipeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.bg, borderRadius: 14, padding: 10,
    borderWidth: 1, borderColor: 'transparent',
  },
  recipeRowSelected: { borderColor: C.hero, backgroundColor: C.accentSoft },
  recipeThumb:       { width: 50, height: 50, borderRadius: 12, backgroundColor: C.surfaceHi },
  recipeName:        { fontSize: 14, fontWeight: '700', color: C.textPrimary },
  recipeChef:        { fontSize: 12, color: C.textSub, marginTop: 2 },
  checkbox: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: C.accentBorder,
    alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface,
  },
  checkboxSelected: { backgroundColor: C.hero, borderColor: C.hero },
});

const d = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 20 : 12,
    paddingBottom: 14, backgroundColor: C.bg, gap: 8,
  },
  backBtn:    { padding: 4 },
  title:      { flex: 1, fontSize: 20, fontWeight: '800', color: C.textPrimary },
  headerRight:{ flexDirection: 'row', gap: 4 },
  iconBtn:    { padding: 6 },
  list:       { paddingHorizontal: 20, paddingBottom: 40, gap: 12, paddingTop: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.surface, borderRadius: 16, padding: 12,
    borderWidth: 0.5, borderColor: '#EDE0D4',
    shadowColor: '#3D2010', shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardDisabled: { backgroundColor: C.disabledBg, borderColor: '#CBD5E1', elevation: 0, shadowOpacity: 0 },
  cardImg:      { width: 64, height: 64, borderRadius: 12, backgroundColor: C.surfaceHi },
  imgDisabled:  { opacity: 0.5 },
  cardInfo:     { flex: 1, gap: 4 },
  cardName:     { fontSize: 15, fontWeight: '700', color: C.textPrimary, lineHeight: 20 },
  textDisabled: { color: C.disabledText },
  cardChef:     { fontSize: 12, color: C.textSub },
  badgeIndisponivel: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#CBD5E1', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6, alignSelf: 'flex-start', marginTop: 2,
  },
  badgeIndisponivelText: { fontSize: 11, fontWeight: '600', color: C.disabledText },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  emptyText:    { fontSize: 16, color: C.textMuted, fontWeight: '500' },
  emptyBtn:     { backgroundColor: C.hero, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 13, marginTop: 4 },
  emptyBtnText: { color: C.white, fontWeight: '800', fontSize: 15 },
});