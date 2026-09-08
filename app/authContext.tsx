import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { comentariosAPI, favoritosAPI, livrosAPI, receitasAPI, usuariosAPI } from './(auth)/api';

interface AuthUser {
  [x: string]: any;
  codUser: number;
  nome_completo: string;
  gmail: string;
  idade: Date;
  restricoesAlimentares?: string;
  Status_Usuario?: string;
  bloqueado: number;
}

interface MediaResponse {
  codReceita: number;
  mediaNota: number;
  totalAvaliacoes: number;
}

export interface Livro {
  codLivro: number;
  nomeLivro: string;
  receitas: ReceitaLivro[];
  fotoLivro: string | null;
  usuario: AuthUser;
}

interface ReceitaLivro {
  codReceitas: number;
  nomeReceita: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLogged: boolean;
  userName: string | null;
  userId: string | null;
  loading: boolean;
  favoritos: any[];      
  recipes: any[];
  updateUser: (novoUsuario: AuthUser) => void;
  addRecipeToBook: (codLivro: number, codReceita: number) => Promise<{ ok: boolean; error?: string }>;
  removeRecipeFromBook: (codLivro: number, codReceita: number) => Promise<{ ok: boolean; error?: string }>;
  createBook: (nome: string) => Promise<{ ok: boolean; error?: string }>;
  deleteBook: (id: number) => Promise<{ ok: boolean; error?: string }>;
  getBookbyId: (id: number) => Promise<{ ok: boolean; error?: string; book?: Livro }>;
  getBookbyUserId: (id: number) => Promise<{ ok: boolean; error?: string; livros?: Livro[] }>;
  updateBook: (data: Livro, id: number) => Promise<{ ok: boolean; error?: string }>;
  register: (nome_completo: string, idade: Date, gmail: string, senha: string) => Promise<{ ok: boolean; error?: string }>;
  updateUserData: (user: AuthUser) => void;
  getComentarios: (receitaId: string) => Promise<any[]>;
  getComentariosByUser: (userId: string) => Promise<any[]>;
  enviarComentario: (receitaId: number, nota: number) => Promise<void>;
  toggleFavorito: (receitaId: string, codReceitas: number) => Promise<void>;
  login: (email: string, senha: string) => Promise<{ ok: boolean; error?: string }>;
  alterarStatus: (usuarioId: number) => Promise<void>;
  reativar: (email: string, senha: string) => Promise<{ ok: boolean }>;
  logout: () => void;
  getMediaReceita: (receitaId: number) => Promise<MediaResponse>;
  EditPhoto: (id: number,link:string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const idStr = await AsyncStorage.getItem('userId');
        if (idStr) {
          const id = Number(idStr);
          await loadFavoritos(id);
          await loadRecipes();
          const res = await usuariosAPI.getById(id);
          if (res.data) setUser(res.data as AuthUser);
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarUsuario();
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      const res = await usuariosAPI.login(email, senha);

      if (res.data) {
        const userData = res.data as AuthUser;
        
        if (userData.funcao !== 'Usuario') {
          return { ok: false, error: 'ACESSO_NEGADO' };
        }
        
        if (userData.bloqueado) {
          console.error("Bloqueado pelo Admin");
          return { ok: false, error: 'CONTA_BLOQUEADA' };
        }
        
        setUser(userData);
        await AsyncStorage.setItem('userId', String(userData.codUser));
        await loadFavoritos(userData.codUser);
        await loadRecipes();
        return { ok: true };
      }
      
      if (res.status === 403) return { ok: false, error: 'CONTA_INATIVA' };
      if(res.status === 401 ) return { ok: false, error: 'Credenciais incorretas' };
      return {ok: false, error: 'uiuiui'};
    } catch {
      return { ok: false, error: 'Senha Incorreta' };
    }
  };

  const updateUserData = (updatedUser: AuthUser) => {
    setUser(updatedUser);
  };

  async function EditPhoto(id:number, link:string) {
    try{
      const res = await usuariosAPI.trocarFoto(id,link)
      if(res.data){
        console.log("foi pae")
      }
    }
    catch{
        return {ok: false, error: "sei la"};
      }
  }

  const logout = async () => {
    setUser(null);
    setFavoritos([]);
    await AsyncStorage.removeItem('userId');
    console.log('Removido com sucesso!');
  };

  async function loadFavoritos(userId: number) {
  try {
    // Chamada para GET http://localhost:8080/favorito/usuario/{id}
    const res = await favoritosAPI.getByUserId(userId); 
    const lista = Array.isArray(res?.data) ? res.data : [];
    setFavoritos(lista);
  } catch (error) {
    console.error("Erro ao carregar favoritos do usuário:", error);
    setFavoritos([]);
  }
}

  async function toggleFavorito(receitaId: string, codReceitas: number) {
  if (!user) return;

  try {
    // Busca a lista atualizada de favoritos diretamente para o usuário logado
    const res = await favoritosAPI.getByUserId(user.codUser);
    const listaFavoritos: any[] = Array.isArray(res?.data) ? res.data : [];

    // Compara item por item para verificar se o id da receita já está presente
    const favoritoExistente = listaFavoritos.find(
      (item) => String(item.receita?.codReceitas ?? item.codReceitas) === String(codReceitas)
    );

    if (favoritoExistente) {
      // Se JÁ EXISTIR: Pega o ID do registro de favorito e dispara a requisição para DELETAR
      const idParaDeletar = favoritoExistente.codFavoritos ?? favoritoExistente.id;
      await favoritosAPI.delete(String(idParaDeletar));
    } else {
      // Se NÃO EXISTIR: Dispara a requisição para ADICIONAR
      await favoritosAPI.create({
        usuario: { codUser: Number(user.codUser) },
        receita: { codReceitas: Number(codReceitas) }
      });
    }

    // Atualiza o estado local recarregando a lista do usuário
    await loadFavoritos(user.codUser);

  } catch (error) {
    console.error("Erro ao alternar favorito:", error);
  }
}

  async function loadRecipes() {
    try {
      const receitas = await receitasAPI.getAll(); 
      if (receitas.status === 200 && Array.isArray(receitas.data)) {
        const listaCompleta = receitas.data as any[];
        const receitasAtivas = listaCompleta.filter((receita: any) => receita.status_receita === 'ATIVO');
        setRecipes(receitasAtivas);
      }
    } catch (error) {
      console.error("Erro ao buscar receitas:", error);
    }
  }

  async function getComentarios(receitaId: string) {
    try {
      const resposta = await comentariosAPI.getByReceitaId(receitaId);
      if (resposta.status === 200 && Array.isArray(resposta.data)) {
        const comentarios = resposta.data as any[];
        return comentarios.filter((comentario: any) => comentario.statusComentarios === 'ATIVO');
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      return []; 
    }
  }

  

  async function getComentariosByUser(userId: string) {
    try {
      const resposta = await comentariosAPI.getAll()
      if (resposta.status === 200 && Array.isArray(resposta.data)) {
        let comentarios = resposta.data as any[];
        console.log(comentarios)
        comentarios = comentarios.filter((comentario: any) => comentario.statusComentarios === 'ATIVO')
        .filter((comentario: any) => comentario.usuario.codUser.toString() === userId);
        console.log(comentarios)
        return comentarios
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      return []; 
    }
  }

  async function enviarComentario(receitaId: number, nota: number) {
    if (!user) return;
    await comentariosAPI.create({
      usuario: { codUser: Number(user.codUser) },
      receita: { codReceitas: receitaId },
      nota,
      status_comentarios: 'ATIVO'
    });
  }

  async function alterarStatus(usuarioId: number) {
    await usuariosAPI.inativar(String(usuarioId));
    logout();
  }

  const updateUser = (novoUsuario: AuthUser) => {
    setUser(novoUsuario);
  };

  async function reativar(email: string, senha: string) {
    const res = await usuariosAPI.reativar(email, senha);
    if (res.data) {
      setUser(res.data as AuthUser);
      await AsyncStorage.setItem('userId', String((res.data as AuthUser).codUser));
      return { ok: true };
    }
    return { ok: false };
  }

  async function register(nome_completo: string, idade: Date, gmail: string, senha: string) {
    const res = await usuariosAPI.create({
      nome_completo,
      idade,
      gmail,
      senha,
      funcao: 'Usuario',
      status_Usuario: 'ATIVO'
    });
    if (res.data) {
      setUser(res.data as AuthUser);
      await AsyncStorage.setItem('userId', String((res.data as AuthUser).codUser));
      return { ok: true };
    }
    return { ok: false, error: res.error };
  }

  async function createBook(nome: string) {
    const result = await livrosAPI.create({
      nomeLivro: nome,
      usuario: { codUser: Number(user?.codUser) }
    });
    if (result.data) {
      return { ok: true };
    }
    return { ok: false, error: result.error };
  }

  async function deleteBook(id: number) {
    const result = await livrosAPI.delete(id);
    if (result.data) {
      return { ok: true };
    }
    return { ok: false, error: result.error };
  }

  const getBookbyId = async (id: number) => {
    try {
      const response = await livrosAPI.getByiD(id);
      return {
        ok: true,
        book: response.data as Livro,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  };

  async function getBookbyUserId(id: number) {
    const result = await livrosAPI.getByUserId(id);
    if (result.data) {
      return { livros: result.data as Livro[], ok: true };
    }
    return { ok: false, error: result.error };
  }

  async function updateBook(data: Livro, id: number) {
    const result = await livrosAPI.save(data, id);
    if (result.data) {
      return { ok: true };
    }
    return { ok: false, error: result.error };
  }

  async function getMediaReceita(receitaId: number): Promise<MediaResponse> {
    try {
      const resposta = await comentariosAPI.getMedia(receitaId);
      const data = resposta.data as MediaResponse;

      if (data && typeof data.mediaNota !== 'undefined') {
        return data;
      }

      return { codReceita: receitaId, mediaNota: 0, totalAvaliacoes: 0 };
    } catch (error) {
      console.error(`Erro ao buscar média da receita ${receitaId}:`, error);
      return { codReceita: receitaId, mediaNota: 0, totalAvaliacoes: 0 };
    }
  }

  async function addRecipeToBook(codLivro: number, codReceita: number) {
    const result = await livrosAPI.addRecipeToBook(codLivro, codReceita);
    if (result.data) {
      return { ok: true };
    }
    return { ok: false, error: result.error };
  }

  async function removeRecipeFromBook(codLivro: number, codReceita: number) {
    const result = await livrosAPI.removeRecipeFromBook(codLivro, codReceita);
    if (result.data) {
      return { ok: true };
    }
    return { ok: false, error: result.error };
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLogged: !!user,
      userName: user?.nome_completo ?? null,
      userId: user ? String(user.codUser) : null,
      loading,
      favoritos,           
      toggleFavorito,
      recipes,
      login,
      reativar,
      alterarStatus,
      logout,
      removeRecipeFromBook,
      addRecipeToBook,
      updateBook,
      createBook,
      deleteBook,
      getBookbyId,
      getBookbyUserId,
      register,
      getComentarios,
      getComentariosByUser,
      enviarComentario,
      updateUserData,
      updateUser,
      getMediaReceita,
      EditPhoto,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  return context;
};