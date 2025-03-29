'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import ThemeButton from '@/app/components/ThemeButton';
import { toast } from 'react-toastify';

export default function Signup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        lastname: '',
        firstname: '',
        email: '',
        password: '',
        birthdate: '',
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const today = new Date();
        const userBirth = new Date(formData.birthdate);
        let age = today.getFullYear() - userBirth.getFullYear();
        const m = today.getMonth() - userBirth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < userBirth.getDate())) {
            age--;
        }
        if (age < 18) {
            toast.error("Vous devez avoir au moins 18 ans pour vous inscrire !");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Utilisateur créé avec succès !");
                toast.success("Inscription réussie !");
                setLoading(false);
                router.push('/auth/login');
            } else {
                setMessage(data.error || "Une erreur est survenue.");
                toast.error(data.error || "Une erreur est survenue.");
                setLoading(false);
            }
        } catch (error) {
            setMessage("Erreur de connexion au serveur.");
            toast.error("Erreur de connexion au serveur.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--primary)] via-[var(--secondary)] to-[var(--primary)] transition-all duration-500">
            <div
                id="registerForm"
                className="signup-container bg-[var(--secondary)] bg-opacity-30 backdrop-blur-xl border border-[var(--border-grey-light)] shadow-xl rounded-3xl p-10 max-w-md w-full relative"
            >
                <ThemeButton />

                <h2 className="text-4xl font-extrabold text-[var(--text-primary)] mb-6 text-center animate-pulse">
                    Inscription
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div id="message" className="text-red-500 text-center">
                        {message}
                    </div>

                    <div className="input-field relative">
                        <label className="block text-left font-semibold mb-2 text-lg text-[var(--text-primary)]">
                            Nom d'utilisateur :
                        </label>
                        <input
                            type="text"
                            name="username"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border-grey-light)] bg-[var(--primary)] bg-opacity-40 text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-gray-300 backdrop-blur-lg transition duration-200 focus:ring-2 focus:ring-[var(--blue)] focus:outline-none"
                            placeholder="Nom d'utilisateur"
                        />
                    </div>

                    <div className="input-field relative">
                        <label className="block text-left font-semibold mb-2 text-lg text-[var(--text-primary)]">
                            Nom :
                        </label>
                        <input
                            type="text"
                            name="lastname"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border-grey-light)] bg-[var(--primary)] bg-opacity-40 text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-gray-300 backdrop-blur-lg transition duration-200 focus:ring-2 focus:ring-[var(--blue)] focus:outline-none"
                            placeholder="Nom"
                        />
                    </div>

                    <div className="input-field relative">
                        <label className="block text-left font-semibold mb-2 text-lg text-[var(--text-primary)]">
                            Prénom :
                        </label>
                        <input
                            type="text"
                            name="firstname"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border-grey-light)] bg-[var(--primary)] bg-opacity-40 text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-gray-300 backdrop-blur-lg transition duration-200 focus:ring-2 focus:ring-[var(--blue)] focus:outline-none"
                            placeholder="Prénom"
                        />
                    </div>

                    <div className="input-field relative">
                        <label className="block text-left font-semibold mb-2 text-lg text-[var(--text-primary)]">
                            Email :
                        </label>
                        <input
                            type="email"
                            name="email"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border-grey-light)] bg-[var(--primary)] bg-opacity-40 text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-gray-300 backdrop-blur-lg transition duration-200 focus:ring-2 focus:ring-[var(--blue)] focus:outline-none"
                            placeholder="Email"
                        />
                    </div>

                    <div className="input-field relative">
                        <label className="block text-left font-semibold mb-2 text-lg text-[var(--text-primary)]">
                            Date de naissance :
                        </label>
                        <input
                            type="date"
                            name="birthdate"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border-grey-light)] bg-[var(--primary)] bg-opacity-40 text-[var(--text-primary)] backdrop-blur-lg transition duration-200 focus:ring-2 focus:ring-[var(--blue)] focus:outline-none"
                        />
                    </div>

                    <div className="input-field relative">
                        <label className="block text-left font-semibold mb-2 text-lg text-[var(--text-primary)]">
                            Mot de passe :
                        </label>
                        <input
                            type="password"
                            name="password"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border-grey-light)] bg-[var(--primary)] bg-opacity-40 text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-gray-300 backdrop-blur-lg transition duration-200 focus:ring-2 focus:ring-[var(--blue)] focus:outline-none"
                            placeholder="Mot de passe"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn w-full rounded-lg bg-gradient-to-r from-[var(--blue)] to-[#3b82f6] text-white px-6 py-3 font-semibold shadow-md transition-all duration-300 hover:from-[#2563eb] hover:to-[#60a5fa] hover:shadow-lg focus:ring-4 focus:ring-blue-500"
                    >
                        {loading ? "Inscription..." : "S'inscrire"}
                    </button>
                </form>

                <p className="text-[var(--text-primary)] text-center mt-6">
                    Déjà un compte ?{" "}
                    <a
                        href="/auth/login"
                        className="font-bold hover:underline"
                    >
                        Connectez-vous
                    </a>
                </p>
            </div>
        </div>
    );
}
