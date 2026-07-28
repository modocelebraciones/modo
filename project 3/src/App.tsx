import { useEffect, useRef, useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import DiscoBall from '@/components/DiscoBall';

const NAV = [
  { label: 'Filosofía', href: '#filosofia' },
  { label: 'Modo de trabajar', href: '#modo' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Contacto', href: '#contacto' },
];

const PRINCIPLES = [
  {
    n: '01',
    title: 'Criterio antes que tendencia',
    body: 'No organizamos matrimonios de época. Organizamos el tuyo.',
  },
  {
    n: '02',
    title: 'Talento, no popularidad',
    body: 'Los mejores proveedores no siempre aparecen primero en Google. Los encontramos nosotros.',
  },
  {
    n: '03',
    title: 'Gastar mejor, no gastar más',
    body: 'Un presupuesto bien usado es una herramienta de diseño. Cada peso con intención.',
  },
];

const WORK = [
  {
    n: '01',
    title: 'Descubrir',
    body: 'Una conversación honesta. Quiénes son, qué les importa, qué quieren evitar. El punto de partida no es un Pinterest.',
  },
  {
    n: '02',
    title: 'Diseñar',
    body: 'Construimos un concepto coherente: identidad, tono, paleta, atmósfera. Cada decisión alineada con la dirección creativa.',
  },
  {
    n: '03',
    title: 'Seleccionar',
    body: 'Curaduría de proveedores por criterio. Cada talento responde a la dirección, no al revés. El presupuesto como otra pieza del diseño.',
  },
  {
    n: '04',
    title: 'Producir',
    body: 'Logística, tiempos y ejecución bajo una sola dirección. Producción integral con precisión.',
  },
  {
    n: '05',
    title: 'Celebrar',
    body: 'El resultado es una experiencia auténtica. Sin guion, sin espectáculo. Solo decisiones bien tomadas.',
  },
];

const PROJECTS = [
  {
    img: 'https://images.pexels.com/photos/3593922/pexels-photo-3593922.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Mesa larga',
    place: 'Valle de Casablanca',
    desc: 'Banquete íntimo para 48. Mesa única, vajilla sin ornamentación, luz cenital.',
  },
  {
    img: 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Ceremonia civil',
    place: 'Casa de campo, Colina',
    desc: 'Ceremonia laica en jardín. Sin protocolo. Palabras, comida y música en vivo.',
  },
  {
    img: 'https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Cena de ensayo',
    place: 'Loft industrial, Santiago',
    desc: 'Reunión previa para 30. Mesa comunal, cocina abierta, conversación como programa.',
  },
  {
    img: 'https://images.pexels.com/photos/313707/pexels-photo-313707.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Diez años',
    place: 'Casa particular, Vitacura',
    desc: 'Aniversario sin agenda. Una noche diseñada alrededor de una sola mesa.',
  },
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

function useFoilShimmer(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    let scrollY = window.scrollY;
    let pointerX = 0.5;
    let raf = 0;

    const apply = () => {
      raf = 0;
      const heroH = el.offsetHeight || 1;
      const progress = Math.min(1, Math.max(0, scrollY / heroH));
      const cursor = pointerX;
      const bgX = 20 + progress * 45 + cursor * 10;
      const sheenX = -40 + progress * 90 + cursor * 25;
      el.style.setProperty('--silver-bg-x', `${bgX}%`);
      el.style.setProperty('--silver-sheen-x', `${sheenX}%`);
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      schedule();
    };

    const onPointer = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointerX = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      schedule();
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [ref]);
}

function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-display font-medium tracking-tightest ${className}`}
      style={{ fontFeatureSettings: "'ss01'" }}
    >
      MODO
    </span>
  );
}

function Header() {
  const scrolled = useScrolled(40);
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${
        scrolled ? 'bg-paper/85 backdrop-blur-md border-b border-black/[0.06]' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-edge px-6 md:px-10">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="#top" className="flex items-center" aria-label="MODO — Inicio">
            <Logo className="text-lg md:text-xl text-ink" />
          </a>
          <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="link-underline text-[13px] tracking-wide text-ink/80 hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href="#contacto"
            className="hidden md:inline-flex items-center text-[13px] tracking-wide text-ink/80 hover:text-ink link-underline"
          >
            Comenzar un proyecto
          </a>
          <button
            className="md:hidden flex flex-col gap-[5px] p-2 -mr-2"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`block w-6 h-px bg-ink transition-transform duration-300 ${open ? 'translate-y-[6px] rotate-45' : ''}`} />
            <span className={`block w-6 h-px bg-ink transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-px bg-ink transition-transform duration-300 ${open ? '-translate-y-[6px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-paper border-t border-black/[0.06]">
          <nav className="px-6 py-6 flex flex-col gap-5" aria-label="Navegación móvil">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-base text-ink/85"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contacto"
              onClick={() => setOpen(false)}
              className="text-base text-ink font-medium pt-2 border-t border-black/[0.06]"
            >
              Comenzar un proyecto
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  useFoilShimmer(heroRef);

  return (
    <section id="top" ref={heroRef} className="relative min-h-[100svh] flex flex-col bg-ink">
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=2000"
          alt="Mesa de celebración contemporánea con vajilla minimalista y luz natural"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/65" />
      </div>

      <div className="flex-1 flex items-end">
        <div className="mx-auto max-w-edge w-full px-6 md:px-10 pb-16 md:pb-24">
          <div className="max-w-3xl">
            <p className="reveal text-[11px] md:text-xs tracking-[0.3em] uppercase text-white/70 mb-6 md:mb-8">
              Dirección creativa · Matrimonios · Producción
            </p>
            <h1 className="reveal reveal-d1 font-display font-medium tracking-tightest text-white text-[15vw] leading-[0.92] sm:text-7xl md:text-8xl lg:text-[7.5rem]">
              <span className="text-silver" data-text="Celebra.">Celebra.</span>
              <br />
              A tu modo.
            </h1>
            <p className="reveal reveal-d2 mt-8 md:mt-10 max-w-xl text-base md:text-lg leading-relaxed text-white/85 font-light">
              Cada matrimonio que hacemos empieza por entender
              a las personas que lo van a vivir.
              Todo lo demás viene después.
            </p>
            <div className="reveal reveal-d3 mt-9 md:mt-12">
              <a
                href="#contacto"
                className="inline-flex items-center gap-3 bg-white text-ink px-7 py-4 text-sm tracking-wide hover:bg-warm transition-colors duration-300"
              >
                Conversemos
                <span aria-hidden className="text-base leading-none">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="mx-auto max-w-edge w-full px-6 md:px-10 pb-6 md:pb-7">
          <div className="flex items-center justify-between text-[11px] tracking-[0.2em] uppercase text-white/55">
            <span>Santiago · Chile</span>
            <span>Scroll</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section className="py-28 md:py-40 bg-warm">
      <div className="mx-auto max-w-edge px-6 md:px-10">
        <div className="grid grid-cols-12 gap-y-10 md:gap-x-10">
          <div className="col-span-12 md:col-span-4">
            <p className="reveal text-[11px] tracking-[0.3em] uppercase text-mute mb-4">
              Manifiesto
            </p>
          </div>
          <div className="col-span-12 md:col-span-7 md:col-start-6">
            <h2 className="reveal reveal-d1 font-display font-medium tracking-tighter2 text-ink text-3xl md:text-4xl leading-[1.1]">
              Nuestra convicción.
            </h2>
            <p className="reveal reveal-d2 mt-6 text-base md:text-lg leading-relaxed text-ink/70 font-light">
              Tu matrimonio no debería parecerse al de nadie más. MODO existe para que cada decisión — el lugar, la comida,
              la luz, el orden del día — responda a quiénes son ustedes.
              Las tendencias pasan. Ustedes se quedan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Philosophy() {
  return (
    <section id="filosofia" className="py-28 md:py-40 bg-paper">
      <div className="mx-auto max-w-edge px-6 md:px-10">
        <div className="mb-16 md:mb-24">
          <p className="reveal text-[11px] tracking-[0.3em] uppercase text-mute mb-4">
            Filosofía
          </p>
          <h2 className="reveal reveal-d1 font-display font-medium tracking-tighter2 text-ink text-4xl md:text-6xl leading-[1.02] max-w-3xl">
            Tres principios
            <br />
            <span className="text-mute">que nos guían en cada proyecto.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px md:gap-0 border-t border-black/10">
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.n}
              className={`reveal reveal-d${i + 1} py-10 md:py-14 md:px-10 first:md:pl-0 last:md:pr-0 border-b md:border-b-0 border-black/10 ${
                i > 0 ? 'md:border-l md:border-black/10' : ''
              }`}
            >
              <span className="text-[11px] tracking-[0.3em] uppercase text-mute2">{p.n}</span>
              <h3 className="mt-6 font-display font-medium tracking-tight text-ink text-xl md:text-2xl leading-snug">
                {p.title}
              </h3>
              <p className="mt-5 text-base leading-relaxed text-ink/70 font-light">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Modo() {
  return (
    <section id="modo" className="py-28 md:py-40 bg-warm">
      <div className="mx-auto max-w-edge px-6 md:px-10">
        <div className="mb-16 md:mb-24 grid grid-cols-12 gap-y-6 md:gap-x-10">
          <div className="col-span-12 md:col-span-5">
            <p className="reveal text-[11px] tracking-[0.3em] uppercase text-mute mb-4">
              Modo de trabajar
            </p>
            <h2 className="reveal reveal-d1 font-display font-medium tracking-tighter2 text-ink text-4xl md:text-6xl leading-[1.02]">
              No hay paquetes.
              <br />
              <span className="text-mute">Hay un proceso.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7 md:pt-3">
            <p className="reveal reveal-d2 text-lg leading-relaxed text-ink/70 font-light">
              Cada matrimonio empieza con una conversación honesta — no con un formulario de
              cotización.
            </p>
          </div>
        </div>

        <div className="border-t border-black/10">
          {WORK.map((s, i) => (
            <div
              key={s.n}
              className={`reveal reveal-d${(i % 3) + 1} group grid grid-cols-12 gap-y-3 md:gap-x-10 py-7 md:py-9 border-b border-black/10 transition-colors duration-500 hover:bg-warm2`}
            >
              <div className="col-span-2 md:col-span-1">
                <span className="text-[11px] tracking-[0.3em] uppercase text-mute2">{s.n}</span>
              </div>
              <div className="col-span-10 md:col-span-4">
                <h3 className="font-display font-medium tracking-tight text-ink text-xl md:text-2xl">
                  {s.title}
                </h3>
              </div>
              <div className="col-span-12 md:col-span-6 md:col-start-7">
                <p className="text-base leading-relaxed text-ink/70 font-light">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section id="proyectos" className="py-28 md:py-40 bg-paper">
      <div className="mx-auto max-w-edge px-6 md:px-10">
        <div className="mb-16 md:mb-24 grid grid-cols-12 gap-y-6 md:gap-x-10">
          <div className="col-span-12 md:col-span-5">
            <p className="reveal text-[11px] tracking-[0.3em] uppercase text-mute mb-4">
              Proyectos
            </p>
            <h2 className="reveal reveal-d1 font-display font-medium tracking-tighter2 text-ink text-4xl md:text-6xl leading-[1.02]">
              Trabajo seleccionado.
            </h2>
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7 md:pt-3">
            <p className="reveal reveal-d2 text-lg leading-relaxed text-ink/70 font-light">
              Cada proyecto responde a una dirección creativa distinta. Sin marcos. Solo
              imágenes y decisiones.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16 md:gap-y-24">
          {PROJECTS.map((p, i) => (
            <figure
              key={p.title}
              className={`reveal reveal-d${(i % 2) + 1} ${i % 2 === 1 ? 'md:mt-24' : ''}`}
            >
              <div className="overflow-hidden bg-warm2">
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover transition-transform duration-[1.4s] ease-smooth group-hover:scale-[1.02]"
                />
              </div>
              <figcaption className="mt-5 flex items-baseline justify-between gap-6">
                <div>
                  <h3 className="font-display font-medium tracking-tight text-ink text-lg">
                    {p.title}
                  </h3>
                  <p className="text-sm text-mute mt-1">{p.place}</p>
                </div>
                <p className="text-sm text-ink/65 font-light text-right max-w-xs">{p.desc}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [state, handleSubmit] = useForm('mwvgyrwk');

  const fieldClass =
    'w-full bg-transparent border-b border-black/15 py-4 text-base text-ink placeholder:text-mute2 focus:outline-none focus:border-ink transition-colors duration-300';

  return (
    <section id="contacto" className="py-28 md:py-40 bg-warm">
      <div className="mx-auto max-w-edge px-6 md:px-10">
        <div className="grid grid-cols-12 gap-y-12 md:gap-x-10">
          <div className="col-span-12 md:col-span-5">
            <p className="reveal text-[11px] tracking-[0.3em] uppercase text-mute mb-4">
              Contacto
            </p>
            <h2 className="reveal reveal-d1 font-display font-medium tracking-tighter2 text-ink text-4xl md:text-6xl leading-[1.02]">
              Conversemos.
            </h2>
            <p className="reveal reveal-d2 mt-8 text-lg leading-relaxed text-ink/70 font-light max-w-md">
              Cuéntanos sobre tu celebración. Respondemos en 48 horas hábiles (a veces menos).
            </p>
            <div className="reveal reveal-d3 mt-12 space-y-3 text-sm text-ink/60">
              <p className="tracking-wide">hola@atumodo.cl</p>
              <p className="tracking-wide">Santiago, Chile</p>
              <p className="tracking-wide">Por encargo · Cupos limitados</p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-6 md:col-start-7">
            {state.succeeded ? (
              <div className="reveal is-visible border border-black/10 p-10 md:p-14 text-center">
                <p className="font-display font-medium tracking-tight text-ink text-2xl">
                  Gracias.
                </p>
                <p className="mt-3 text-base text-ink/65 font-light">
                  Recibimos tu mensaje. Te responderemos pronto.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2" noValidate>
                <div className="reveal grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <label className="block">
                    <span className="text-[11px] tracking-[0.2em] uppercase text-mute">Nombre</span>
                    <input required name="nombre" autoComplete="name" className={fieldClass} />
                  </label>
                  <label className="block">
                    <span className="text-[11px] tracking-[0.2em] uppercase text-mute">Email</span>
                    <input
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      className={fieldClass}
                    />
                    <ValidationError
                      field="email"
                      errors={state.errors}
                      className="mt-1 text-xs text-red-700"
                    />
                  </label>
                </div>
                <div className="reveal reveal-d1 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <label className="block">
                    <span className="text-[11px] tracking-[0.2em] uppercase text-mute">Fecha</span>
                    <input type="date" name="fecha" className={fieldClass} />
                  </label>
                  <label className="block">
                    <span className="text-[11px] tracking-[0.2em] uppercase text-mute">Ciudad</span>
                    <input name="ciudad" autoComplete="address-level2" className={fieldClass} />
                  </label>
                </div>
                <label className="reveal reveal-d2 block pt-2">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-mute">
                    Cuéntanos sobre tu celebración
                  </span>
                  <textarea
                    name="mensaje"
                    rows={4}
                    className={`${fieldClass} resize-none`}
                  />
                  <ValidationError
                    field="mensaje"
                    errors={state.errors}
                    className="mt-1 text-xs text-red-700"
                  />
                </label>
                <div className="reveal reveal-d3 pt-6">
                  <button
                    type="submit"
                    disabled={state.submitting}
                    className="inline-flex items-center gap-3 bg-ink text-paper px-7 py-4 text-sm tracking-wide hover:bg-olive transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.submitting ? 'Enviando…' : 'Conversemos'}
                    <span aria-hidden>→</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-edge px-6 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-12 gap-y-12 md:gap-x-10">
          <div className="col-span-12 md:col-span-6">
            <Logo className="text-3xl md:text-5xl text-paper" />
            <p className="mt-6 max-w-md text-base leading-relaxed text-paper/60 font-light">
              Dirección creativa, estrategia y producción de celebraciones contemporáneas.
            </p>
          </div>
          <div className="col-span-6 md:col-span-3 md:col-start-8">
            <p className="text-[11px] tracking-[0.3em] uppercase text-paper/40 mb-5">Navegación</p>
            <ul className="space-y-3">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    className="text-sm text-paper/75 hover:text-paper link-underline"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-6 md:col-span-3">
            <p className="text-[11px] tracking-[0.3em] uppercase text-paper/40 mb-5">Contacto</p>
            <ul className="space-y-3 text-sm text-paper/75">
              <li>hola@atumodo.cl</li>
              <li>Santiago, Chile</li>
              <li className="pt-2">
                <a href="#contacto" className="link-underline hover:text-paper">
                  Comenzar un proyecto →
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 md:mt-24 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[11px] tracking-[0.2em] uppercase text-paper/40">
            © {new Date().getFullYear()} MODO. Todos los derechos reservados.
          </p>
          <p className="text-[11px] tracking-[0.2em] uppercase text-paper/40">
            Celebra. A tu modo.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  useReveal();

  return (
    <div className="relative bg-paper text-ink antialiased">
      <Header />
      <main className="relative z-10">
        <Hero />
        <Manifesto />
        <Philosophy />
        <Modo />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <DiscoBall />
    </div>
  );
}
