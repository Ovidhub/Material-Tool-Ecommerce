import { TargetIcon, UsersIcon, ZapIcon, ShieldIcon, LeafIcon, BulbIcon } from "../components/Icons";
import { useStore } from "../context/StoreContext";

export default function About() {
  const { state } = useStore();
  const site = state.siteContent;
  const valueIcons = [TargetIcon, UsersIcon, ZapIcon, ShieldIcon, LeafIcon, BulbIcon];
  const values = site.aboutValues.map((value, index) => ({ ...value, Icon: valueIcons[index] || BulbIcon }));
  return (
    <div className="bg-neutral-50">
      <section className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-3">{site.aboutHeroEyebrow}</div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">{site.aboutHeroTitle} <span className="text-red-500">{site.aboutHeroHighlight}</span></h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">{site.aboutHeroText}</p>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-6 text-center">
        {[{ value: "25+", label: "Years in Business" }, { value: "500K+", label: "Happy Customers" }, { value: "10K+", label: "Products In Stock" }, { value: "4.9★", label: "Average Rating" }].map((s, i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-sm p-6"><div className="text-3xl font-black text-red-600">{s.value}</div><div className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-bold">{s.label}</div></div>
        ))}
      </section>
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="bg-red-600 rounded overflow-hidden"><img src={site.aboutImage} alt="About" className="w-full h-80 object-cover mix-blend-luminosity opacity-80" /></div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-red-600 mb-2">{site.aboutMissionEyebrow}</div>
            <h2 className="text-2xl font-black text-neutral-900 mb-4">{site.aboutMissionTitle}</h2>
            <p className="text-sm text-neutral-600 leading-relaxed mb-3">{site.aboutMissionBody1}</p>
            <p className="text-sm text-neutral-600 leading-relaxed">{site.aboutMissionBody2}</p>
          </div>
        </div>
      </section>
      <section className="bg-white border-y border-neutral-200 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8"><div className="text-xs font-bold uppercase tracking-widest text-red-600 mb-2">{site.aboutValuesEyebrow}</div><h2 className="text-2xl font-black text-neutral-900 uppercase">{site.aboutValuesTitle}</h2></div>
          <div className="grid md:grid-cols-3 gap-4">
            {values.map((v, i) => (
              <div key={i} className="bg-neutral-50 border border-neutral-200 rounded-sm p-5 hover:shadow-lg transition group">
                <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 grid place-items-center mb-4 group-hover:bg-red-600 transition">
                  <v.Icon className="w-6 h-6 text-red-600 group-hover:text-white transition" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-1">{v.title}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12"><div className="text-xs font-bold uppercase tracking-widest text-red-600 mb-2">{site.aboutTeamEyebrow}</div><h2 className="text-2xl font-black text-neutral-900 uppercase">{site.aboutTeamTitle}</h2></div>
        <div className="grid md:grid-cols-4 gap-6">
          {[{ name: "Alex Morrison", role: "CEO & Founder" }, { name: "Priya Sharma", role: "Head of Product" }, { name: "Carlos Reyes", role: "Master Toolsmith" }, { name: "Jordan Blake", role: "Customer Success" }].map((m, i) => (
            <div key={i} className="text-center">
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-red-600 to-red-800 grid place-items-center text-4xl font-black text-white mb-4 shadow-xl">
                {m.name[0]}
              </div>
              <div className="font-bold text-neutral-900">{m.name}</div><div className="text-sm text-neutral-500">{m.role}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
