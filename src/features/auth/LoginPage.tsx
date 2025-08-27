// src/pages/auth/Login.tsx
import { useEffect, type FC, useState } from "react";
import useAuth from "../../shared/context/auth/AuthContext";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import Button from "../../shared/components/commons/Button";
import logo from '../../assets/logo.png';
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Card from "../../shared/components/commons/Card";
import Input from "../../shared/components/form/Input";

const Login: FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login, currentUser } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm();

    const onSubmit = async (data: any) => {
        try {
            await login(data.email, data.password);
            navigate('/');
        } catch (err) {
            setError("root", {
                type: "manual",
                message: "Error al iniciar sesión. Verifica tus credenciales.",
            });
            console.error(err);
        }
    };

    useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full mb-20">
                <div className="text-center mb-8">
                    <img src={logo} alt="Logo de Hallmay" className="h-24 w-24 object-contain mx-auto" />
                    <h2 className="mt-4 text-3xl font-bold text-text-primary">Bienvenido a Hallmay</h2>
                    <p className="text-text-secondary">Ingresa tus credenciales para continuar</p>
                </div>

                <Card className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {errors.root && (
                            <p className="bg-red-50 text-red-700 p-3 rounded-lg text-center text-sm font-semibold">
                                {errors.root.message as string}
                            </p>
                        )}

                        <div className="relative">
                            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="Correo Electrónico"
                                inputClassName="pl-10"
                                {...register('email', { required: 'El correo es obligatorio.' })}
                                error={errors.email?.message as string}
                            />
                        </div>

                        <div className="relative">
                            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Contraseña"
                                inputClassName="pl-10 pr-10"
                                {...register('password', { required: 'La contraseña es obligatoria.' })}
                                error={errors.password?.message as string}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <Button type="submit" isLoading={isSubmitting} className="w-full !py-3">
                            {isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Login;