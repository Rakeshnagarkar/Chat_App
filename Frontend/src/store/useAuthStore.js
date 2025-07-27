import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

export const useAuthStore = create((set, get) => ({

    BASE_URL: import.meta.env.MODE === "development"
        ? "http://localhost:5001"
        : import.meta.env.VITE_BASE_URL,


    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],

    checkAuth: async () => {

        try {

            const res = await axiosInstance.get("/auth/check", { withCredentials: true });

            set({ authUser: res.data })
            get().connectSocket();

        } catch (error) {
            console.log("Error in checking auth", error);
            set({ authUser: null })
        }

        finally {
            set({ isCheckingAuth: false })
        }

    },

    signup: async (data) => {

        set({ isSigningUp: true })

        try {

            const res = await axiosInstance.post("/auth/signup", data)
            set({ authUser: res.data })
            toast.success("Account created successfully")

        } catch (error) {

            toast.error(error.response.data.message)


        }

        finally {
            set({ isSigningUp: false })
        }

    },

    login: async (data) => {

        set({ isLoggingIn: true })

        try {

            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully");

            get().connectSocket();

        } catch (error) {
            toast.error(error.response.data.message);
        }

        finally {
            set({ isLoggingIn: false })
        }

    },

    logout: async () => {

        try {

            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();

        } catch (error) {

            toast.error(error.response.data.message)

        }

    },

    updateProfile: async (data) => {

        set({ isUpdatingProfile: true })

        try {

            const res = await axiosInstance.post("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");

        } catch (error) {
            console.log("Error in updating profile", error);
            toast.error(error.response.data.message);
        }

        finally {
            set({ isUpdatingProfile: false })
        }

    },

    connectSocket: () => {
        const { authUser, BASE_URL } = get();

        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            withCredentials: true,
            transports: ["websocket"],
            query: {
                userId: authUser._id,
            }
        });

        socket.connect();

        set({ socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds })
        })
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket && socket.connected) {
            socket.disconnect();
            set({ socket: null });
        }
    },


}))