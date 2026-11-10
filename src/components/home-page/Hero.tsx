import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

type MediaLike = { url?: string; src?: string };
type Props = { title: string; description: string; gallery: MediaLike[]; logo_dc3?: MediaLike };
const srcOf = (m?: MediaLike) => m?.url || m?.src || "";

export const HomeHero: React.FC<Props> = ({ title, description, gallery, logo_dc3 }) => {
  const slides = (gallery || []).filter((item) => Boolean(srcOf(item)));
  const logo = srcOf(logo_dc3);
  return (
    <section className="relative isolate min-h-[540px] h-[72svh] max-h-[850px] overflow-hidden bg-[#090a0e] text-white" aria-label="Presentación del catálogo">
      <div className="absolute inset-0 z-0">
        {slides.length > 0 ? (
          <Swiper modules={[Autoplay, EffectFade]} effect="fade" autoplay={{ delay: 6500, disableOnInteraction: false }} loop={slides.length > 1} className="h-full w-full">
            {slides.map((item, i) => (
              <SwiperSlide key={i}>
                <img src={srcOf(item)} alt={i === 0 ? title : `Figura destacada ${i + 1}`} className="h-full w-full object-cover object-center" loading={i === 0 ? "eager" : "lazy"} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : <div className="h-full w-full bg-gradient-to-br from-[#161b25] via-[#100d10] to-black" />}
      </div>
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/90 via-black/60 to-black/15" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#090a0e] via-transparent to-black/20" />
      <div className="relative z-20 mx-auto flex h-full w-full max-w-[1440px] flex-col justify-center px-6 py-16 sm:px-10 lg:px-20">
        <div className="max-w-[760px]">
          {logo && <img src={logo} alt="Logo Endino Cat 3D" className="mb-6 h-20 w-20 object-contain drop-shadow-xl sm:h-24 sm:w-24" />}
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-[#ff766a]">DCIMPRESS3D STORE / FIGURAS Y MODELOS 3D</p>
          <h1 className="max-w-[740px] text-5xl font-black uppercase leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[clamp(4rem,6vw,6.5rem)]">Personajes que <span className="text-[#ff5b4f]">cobran vida.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{description || "Explora figuras, personajes y ediciones para tu próxima impresión 3D."}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="/explorar" className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#e94235] px-7 text-xs font-extrabold uppercase tracking-[0.12em] text-white transition hover:bg-[#ff6254] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Explorar personajes <span className="ml-3" aria-hidden="true">↗</span></a>
            <a href="/shop" className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/35 bg-black/30 px-7 text-xs font-extrabold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Catálogo completo</a>
          </div>
        </div>
        <div className="absolute bottom-7 left-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/55 sm:left-10 lg:left-20"><span className="h-px w-9 bg-[#ff5b4f]" /> Descubre tu próxima figura</div>
      </div>
    </section>
  );
};
