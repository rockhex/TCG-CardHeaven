import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Button from '../components/atoms/Button';
import { login, register } from '../store/slices/authSlice';

const Arrow = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className}>
        <path d="m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240-240 240Z"/>
    </svg>
);

const Authentication = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 1. Estado único para todos los datos de autenticación
  const [datosAuth, setDatosAuth] = useState({
    nombre: "",
    email: "",
    pass: "",
    confirmPass: ""
  });

  // 2. Estado para el control de errores (inicializan en true)
  const [validationAuth, setValidationAuth] = useState({
    nombre: true,
    email: true,
    pass: true,
    confirmPass: true
  });

  // Limpiamos estados y errores al alternar entre Login y Registro
  const handleToggleRegister = () => {
    setIsRegister((prev) => !prev);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const isFormValid = validateForm();

    if (isFormValid) {
        setSubmitting(true);
        try {
          if (isRegister) {
            await dispatch(register({ name: datosAuth.nombre, email: datosAuth.email, password: datosAuth.pass })).unwrap();
          } else {
            await dispatch(login({ email: datosAuth.email, password: datosAuth.pass })).unwrap();
          }
          navigate('/');
        } catch (err) {
          setError(err || 'No se pudo completar la operación.');
        } finally {
          setSubmitting(false);
        }
          setValidationAuth({ nombre: true, email: true, pass: true, confirmPass: true });
    } else {
      console.log("Corrige los campos marcados en rojo antes de continuar.");
    }

  };

  // 3. Reglas de validación individuales
  const checkFieldValidity = (field, value, currentData = datosAuth) => {
    // Si estamos en Login, ignoramos olímpicamente las validaciones de registro
    if (!isRegister && (field === 'nombre' || field === 'confirmPass')) {
      return true;
    }

    switch (field) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'nombre':
        return value.trim().length >= 2;
      case 'pass':
        return value.length >= 6; // Mínimo de 6 caracteres para seguridad básica
      case 'confirmPass':
        return value === currentData.pass; // Valida que coincida con la contraseña original
      default:
        return true;
    }
  };

  const validateField = (field, value) => {
    const updatedData = { ...datosAuth, [field]: value };
    
    setValidationAuth(prev => {
      const newState = {
        ...prev,
        [field]: checkFieldValidity(field, value, updatedData)
      };

      // Si el usuario modifica la contraseña principal, revalidamos la confirmación automáticamente
      if (field === 'pass' && isRegister && datosAuth.confirmPass) {
        newState.confirmPass = datosAuth.confirmPass === value;
      }

      return newState;
    });
  };

  // 4. Validación dinámica completa antes del Submit
  const validateForm = () => {
    const newValidationState = Object.keys(datosAuth).reduce((acc, key) => {
      acc[key] = checkFieldValidity(key, datosAuth[key]);
      return acc;
    }, {});

    setValidationAuth(newValidationState);
    return Object.values(newValidationState).every((isValid) => isValid === true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
    setDatosAuth(prev => ({ ...prev, [name]: value }));
  };

  // Estilo dinámico adaptado a tu diseño border-b anterior
  const getInputClassName = (isValid) => `border-b p-3 outline-none transition-colors ${
    !isValid 
      ? 'border-red-500 bg-red-50/50 focus:border-red-600' 
      : 'border-neutral focus:border-black'
  }`;

  return (
    <section className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
        <div className="max-w-md w-full p-8 border border-t-4 border-t-secondary shadow-md" style={{ backgroundColor: 'var(--color-surface)' }}>
            <h2 className="text-2xl font-display font-bold mb-6 text-center" style={{ color: 'var(--color-primary)' }}>
                {isRegister ? 'Crear una cuenta' : 'Bienvenido de nuevo' }
            </h2>
            <p className="text-base mb-4 text-center" style={{ color: 'var(--color-neutral)' }}>
                Inicia sesión o regístrate para asegurar tu colección.
            </p>
            
            <div className="flex gap-0">
                <div className={"flex-auto cursor-pointer text-center py-4 select-none" + (!isRegister ? ' font-semibold border-b-2 border-b-primary' : ' border-b')} onClick={handleToggleRegister}>
                    Iniciar Sesión
                </div>
                <div className={"flex-auto cursor-pointer text-center py-4 select-none" + (isRegister ? ' font-semibold border-b-2 border-b-primary' : ' border-b')} onClick={handleToggleRegister}>
                    Registrarse
                </div>
            </div>

            {/* Pasamos el handleSubmit directamente al evento nativo del form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {isRegister && (
                  <div className='flex flex-col w-full'>
                    <label htmlFor="nombre" className='text-sm font-semibold mb-1'>Nombre Completo</label>
                    <input 
                      type="text" 
                      name="nombre" 
                      id="nombre" 
                      placeholder="Tu nombre"
                      className={getInputClassName(validationAuth.nombre)} 
                      value={datosAuth.nombre}
                      onChange={handleChange}
                    />
                    {!validationAuth.nombre && <span className="text-red-500 text-xs mt-1">Mínimo 2 caracteres.</span>}
                  </div>
                )}
                
                <div className='flex flex-col w-full'>
                    <label htmlFor="email" className='text-sm font-semibold mb-1'>Correo Electrónico</label>
                    <input 
                      type="email" 
                      name="email" 
                      id="email" 
                      placeholder="entrenador@ejemplo.com"
                      className={getInputClassName(validationAuth.email)} 
                      value={datosAuth.email}
                      onChange={handleChange}
                    />
                    {!validationAuth.email && <span className="text-red-500 text-xs mt-1">Ingresa un correo válido.</span>}
                </div>
                
                <div className='flex flex-col w-full'>
                    <label htmlFor="pass" className='text-sm font-semibold mb-1'>Contraseña</label>
                    <input 
                      type="password" 
                      name="pass" 
                      id="pass" 
                      placeholder="••••••••"
                      className={getInputClassName(validationAuth.pass)} 
                      value={datosAuth.pass}
                      onChange={handleChange}
                    />
                    {!validationAuth.pass && <span className="text-red-500 text-xs mt-1">Debe contener al menos 6 caracteres.</span>}
                </div>
                
                {isRegister && (
                  <div className='flex flex-col w-full'>
                    <label htmlFor="confirmPass" className='text-sm font-semibold mb-1'>Confirmar Contraseña</label>
                    <input 
                      type="password" 
                      name="confirmPass" 
                      id="confirmPass" 
                      placeholder="••••••••"
                      className={getInputClassName(validationAuth.confirmPass)} 
                      value={datosAuth.confirmPass}
                      onChange={handleChange}
                    />
                    {!validationAuth.confirmPass && <span className="text-red-500 text-xs mt-1">Las contraseñas no coinciden.</span>}
                  </div>
                )}
                
                {error && <p className="text-sm text-center" style={{ color: 'var(--color-error)' }}>{error}</p>}

                <Button type="submit" color="secondary" className="w-full mt-6" rightIcon={<Arrow />} disabled={submitting}>
                    {submitting ? 'Procesando…' : (isRegister ? 'Crear Cuenta' : 'Iniciar Sesión')}
                </Button>
            </form>
        </div>
    </section>
  )
}

export default Authentication;