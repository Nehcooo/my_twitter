'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "../../ClientLayout";
import ThemeButton from '@/app/components/ThemeButton';
import { toast } from 'react-toastify';

export default function Login() {
    const { refreshUserId } = useUser();

    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            refreshUserId();

            if (response.ok) {
                setMessage("Connexion réussie !");
                setLoading(false);
                router.push('/');
            } else {
                if (response.status === 401) {
                    toast.error("Mot de passe incorrect !");
                } else {
                    toast.error(data.error || "Une erreur est survenue.");
                }
                setError(data.error || "Une erreur est survenue.");
                setLoading(false);
            }
        } catch (error) {
            setError("Erreur de connexion au serveur.");
            toast.error("Erreur de connexion au serveur.");
            setLoading(false);
        }
    };

    return (
        <div className="relative flex w-[90%] max-lg:w-[400px] h-auto bg-[var(--secondary)] shadow-lg rounded-2xl overflow-hidden m-auto mt-2">

            <div className="max-lg:hidden w-1/2 relative bg-[var(--blue)] flex flex-col justify-center items-center p-16 text-[var(--white)] rounded-2xl">
                <div className="max-lg:hidden absolute -right-10 transform bg-[var(--white)] p-2 rounded-full shadow-lg border border-[var(--border-grey-light)]">
                    <img
                        src="/img/logoSite.jpg"
                        alt="Logo"
                        className="w-20 h-20 rounded-full shadow-lg cursor-pointer animate-ping"
                    />
                </div>
                
                <h1 className="text-5xl font-bold mb-8">MMJ</h1>
                <p className="text-2xl mb-10 text-center leading-relaxed">
                    Restes connecté au monde qui t'entoure
                </p>
                <ul className="space-y-6 text-xl">
                    <li>🔗 Reste branché</li>
                    <li>🔒 Sécurises ton compte</li>
                    <li>👥 Follow tes amis !</li>
                    <li>💬 Rejoins des conversations</li>
                    <li>📍 Trouves des amis</li>
                    <li>📖 Partages tes storys</li>
                </ul>
            </div>

            <div className="w-[100%] p-12 flex flex-col justify-center rounded-2xl">
                <h1 className="text-5xl font-bold tracking-wider mb-12 text-center">
                    Connexion
                </h1>

                <div
                    id="login-message"
                    className="text-red-500 mb-6 text-center"
                ></div>

                <form
                    onSubmit={handleSubmit}
                    id="loginForm"
                    className="flex flex-col items-center w-full gap-8"
                >
                    <div className="w-[80%] max-lg:w-[100%]">
                        <label className="block text-left font-semibold mb-3 ml-2 text-lg">
                            Email :
                        </label>
                        <div className="relative flex items-center">
                            <input
                                type="email"
                                name="email"
                                required
                                onChange={handleChange}
                                className="w-full mb-4 rounded-3xl border border-[var(--border-grey-light)] bg-[var(--primary)] pl-14 max-lg:pl-6 py-4 text-[var(--text-primary)] placeholder-[var(--text-grey)] text-lg shadow-md outline-none focus:ring-2 focus:ring-[var(--blue)]"
                                placeholder="Entrez votre mail"
                            />
                        </div>
                    </div>

                    <div className="w-[80%] max-lg:w-[100%]">
                        <label className="block text-left font-semibold mb-3 ml-2 text-lg">
                            Mot de passe :
                        </label>
                        <div className="relative flex items-center">
                            <input
                                type="password"
                                name="password"
                                required
                                onChange={handleChange}
                                className="w-full mb-6 rounded-3xl border border-[var(--border-grey-light)] bg-[var(--primary)] pl-14 max-lg:pl-6  py-4 text-[var(--text-primary)] placeholder-[var(--text-grey)] text-lg shadow-md outline-none focus:ring-2 focus:ring-[var(--blue)]"
                                placeholder="Mots de passe"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-[80%] max-lg:w-[100%] rounded-3xl bg-[var(--blue)] px-10 py-4 text-white text-lg font-semibold shadow-md transition-colors duration-300 hover:bg-opacity-80 cursor-pointer"
                    >
                        Se connecter
                    </button>

                    <div className="text-center text-md text-[var(--text-grey)] mt-6">
                        <a
                            href="#"
                            className="text-[var(--blue)] hover:underline"
                        >
                            Mot de passe oublié ?
                        </a>
                    </div>

                    <div className="text-center text-md text-[var(--text-grey)] mt-2">
                        <a
                            href="/auth/signup"
                            className="text-[var(--blue)] hover:underline"
                        >
                            S'inscrire
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}