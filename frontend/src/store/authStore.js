import create from 'zustand';

const authStore = create((set) => ({
    usuario: null,
    token: null,
    isAuthenticated: false,

    setUsuario: (usuario, token) => set({
        usuario,
        token,
        isAuthenticated: !!token
    }),

    logout: () => {
        localStorage.removeItem('token');
        set({ usuario: null, token: null, isAuthenticated: false });
    },

    checkAuth: () => {
        const token = localStorage.getItem('token');
        if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            set({ token, isAuthenticated: true });
        } catch (e) {
            localStorage.removeItem('token');
        }
        }
    }
}));

export default authStore;
