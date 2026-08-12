import ContainerBasic from "../components/atoms/ContainerBasic"
import Hero from "../components/atoms/Hero"
import heroImage from '../assets/hero-nosotros.png';
import nosotrosImage from '../assets/nosotros-1.png';

const AboutUs = () => {

  return (<>
    <Hero heroImage={heroImage}>
      <h2 className="text-2xl lg:text-4xl font-display font-bold text-center" style={{ color: 'var(--color-primary)' }}>
          Curando lo Extraordinario
      </h2>
      <p className="text-body text-center">
          Desde la emoción del primer sobre hasta la precisión de la calificación final. <br className="hidden md:block" />
          Card Heaven es un santuario para coleccionistas serios, construido sobre una base de autenticidad y preservación obsesiva.
      </p>
    </Hero>
    <ContainerBasic>
      <div className="py-20 grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 md:col-span-6 lg:col-span-6 lg:col-start-2">
          <h3 className="text-body font-display font-bold mb-4 uppercase" style={{ color: 'var(--color-neutral)' }}>
            Nuestra Historia
          </h3>
          <h4 className="text-2xl font-display font-bold mb-4" style={{ color: 'var(--color-primary)' }}>De Aficionado a Archivista</h4>
          <p className="text-body mb-6">
            Lo que comenzó como una fascinación infantil con el cartón vibrante rápidamente evolucionó hacia una búsqueda de la perfección de por vida. La transición no estuvo marcada por una sola colección, sino por un despertar al delicado arte de la preservación.
          </p>
          <p className="text-body mb-6">
            Cada carta que pasa por Card Heaven no es solo inventario; es una pieza de historia que exige respeto. Nos abastecemos a nivel mundial, autenticando con un ojo intransigente, asegurando que cuando adquieres una pieza nuestra, estás invirtiendo en un legado certificado.
          </p>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-4 lg:col-end-12"><img src={nosotrosImage} alt="Nuestra Historia" className="w-full h-auto rounded-lg shadow-md" /></div>
      </div>
    </ContainerBasic>
    <div className="bg-surface-container-low">
      <ContainerBasic className="py-20 grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 text-center">
          <h3 className="text-body font-display font-bold mb-4 uppercase" style={{ color: 'var(--color-neutral)' }}>
            Filosofía
          </h3>
          <h4 className="text-2xl font-display font-bold mb-4" style={{ color: 'var(--color-primary)' }}>El Arte de la Preservación</h4>
        </div>
        <div className="col-span-12 md:col-span-4 px-7 py-8 bg-surface shadow-md h-full">
          <h5 className="text-lg font-display font-semibold mb-4 text-center" style={{ color: 'var(--color-primary)' }}>Autenticidad Intransigente</h5>
          <p className="text-body text-center" style={{ color: 'var(--color-neutral)' }}>
            Cada pieza es sometida a un riguroso proceso de verificación de múltiples puntos antes de entrar a nuestra bóveda. Toleramos cero ambigüedad.
          </p>
        </div>
        <div className="col-span-12 md:col-span-4 px-7 py-8 bg-surface shadow-md h-full">
          <h5 className="text-lg font-display font-semibold mb-4 text-center" style={{ color: 'var(--color-primary)' }}>Condición Prístina</h5>
          <p className="text-body text-center" style={{ color: 'var(--color-neutral)' }}>
            Nos especializamos en estados near-mint a gem-mint. Nuestros procedimientos de manejo rivalizan con los estándares de archivos de museos para prevenir micro-abrasiones.
          </p>
        </div>
        <div className="col-span-12 md:col-span-4 px-7 py-8 bg-surface shadow-md h-full">
          <h5 className="text-lg font-display font-semibold mb-4 text-center" style={{ color: 'var(--color-primary)' }}>Procedencia Curada</h5>
          <p className="text-body text-center" style={{ color: 'var(--color-neutral)' }}>
            Más allá del cartón, valoramos la historia. Rastreamos la procedencia y el origen siempre que sea posible, añadiendo profundidad narrativa a cada adquisición.
          </p>
        </div>
      </ContainerBasic>
    </div>
  </>)
}

export default AboutUs