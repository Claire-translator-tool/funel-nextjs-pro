"use client";

import React, { useEffect, useState } from "react";
import { 
  Globe, 
  MessageCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Settings, 
  Waves, 
  Zap, 
  Package, 
  Factory 
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Components ---

const TopBar = () => (
  <div className="bg-black text-white py-2 px-6 flex justify-between items-center text-xs font-medium tracking-wide">
    <div className="flex gap-4 items-center opacity-90">
      <div className="flex items-center gap-1">
        <ShieldCheck size={14} className="text-accent" />
        <span>ISO 9001 CERTIFIED</span>
      </div>
      <div className="flex items-center gap-1">
        <CheckCircle2 size={14} className="text-accent" />
        <span>CE COMPLIANT</span>
      </div>
    </div>
    <div className="flex gap-6 items-center">
      <div className="flex items-center gap-2">
        <Globe size={14} />
        <select className="bg-transparent border-none focus:ring-0 cursor-pointer">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="pt">Português</option>
          <option value="ru">Русский</option>
        </select>
      </div>
      <a href="https://wa.me/8615606523212" className="hover:text-accent transition-colors flex items-center gap-1">
        <MessageCircle size={14} />
        <span>WhatsApp: +86 15606523212</span>
      </a>
    </div>
  </div>
);

const Nav = () => (
  <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
    <a href="#" className="flex items-center gap-3">
      <img 
        src="https://sc01.alicdn.com/kf/Abeefe2fc62fe493e9b8a2a7f7c9e5e36c.png" 
        alt="FUNEL" 
        className="h-10 w-auto"
      />
      <span className="text-2xl font-black text-blue-900 tracking-tighter">FUNEL®</span>
    </a>
    <div className="hidden md:flex gap-8 text-sm font-bold text-gray-700 uppercase tracking-widest">
      <a href="#products" className="hover:text-primary transition-colors">Products</a>
      <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
      <a href="#automation" className="hover:text-primary transition-colors">Automation</a>
      <a href="#about" className="hover:text-primary transition-colors">About</a>
    </div>
    <div className="flex items-center gap-4">
      <Button variant="outline" className="hidden lg:flex border-primary text-primary font-bold rounded-full">
        Technical Docs
      </Button>
      <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full px-6 shadow-lg shadow-primary/20">
        Inquiry Now
      </Button>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#08120f]">
    {/* Background Image with Overlay */}
    <div 
      className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] hover:scale-110"
      style={{ 
        backgroundImage: "url('https://sc01.alicdn.com/kf/A11e5f71d92044394adbceea5ff5434735.png')",
        filter: "brightness(0.4)"
      }}
    />
    
    <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center pt-12 pb-20">
      <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
        <div className="inline-block px-4 py-1.5 bg-primary/20 border border-primary/30 backdrop-blur-sm rounded-full text-accent text-sm font-black tracking-[0.2em] uppercase">
          World-Class Instrumentation
        </div>
        <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
          Reliable Water <br/>
          <span className="text-primary-foreground">Monitoring</span> <br/>
          Systems.
        </h1>
        <p className="text-xl text-gray-300 max-w-lg leading-relaxed font-medium">
          Supplying high-precision online analyzers, digital probes, and integrated SCADA systems for global municipal and industrial projects.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white h-14 px-8 text-lg font-bold rounded-xl">
            Explore Analyzers <ArrowRight className="ml-2" />
          </Button>
          <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-white h-14 px-8 text-lg font-bold rounded-xl backdrop-blur-md">
            Request Quote
          </Button>
        </div>
      </div>

      <div className="hidden lg:block animate-in fade-in zoom-in duration-1000 delay-300">
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white/20 transform rotate-2 hover:rotate-0 transition-transform duration-700">
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">Live Monitoring Data</span>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "COD Value", val: "42.5", unit: "mg/L" },
                { label: "Turbidity", val: "0.12", unit: "NTU" },
                { label: "pH Level", val: "7.42", unit: "pH" },
                { label: "Temp", val: "24.5", unit: "°C" },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-1">{item.label}</p>
                  <p className="text-2xl font-black text-primary">{item.val} <span className="text-sm font-bold text-gray-400">{item.unit}</span></p>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <p className="text-sm font-bold text-primary flex items-center gap-2">
                  <Zap size={16} /> System Health: Optimal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const TrustStats = () => (
  <div className="bg-white py-12 border-b border-gray-100">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { icon: Factory, label: "15+ Years", sub: "Technical Exp" },
          { icon: Globe, label: "50+ Countries", sub: "Global Shipping" },
          { icon: Settings, label: "1000+ Projects", sub: "Annual Support" },
          { icon: MessageCircle, label: "24/7", sub: "Expert Response" },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center text-center space-y-2 group">
            <div className="text-primary group-hover:scale-110 transition-transform duration-300">
              <stat.icon size={32} />
            </div>
            <p className="text-2xl font-black text-gray-900">{stat.label}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Categories = () => (
  <section id="products" className="py-24 bg-[#f9fbfa]">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16 space-y-4">
        <div className="text-primary font-black tracking-widest uppercase text-sm">Product Families</div>
        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">Precise Solutions for Every Point</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Large Split Cards - Zhixin Style */}
        <div className="relative group rounded-[40px] overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all duration-500 h-[500px]">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] group-hover:scale-110" 
            style={{ backgroundImage: "url('https://sc01.alicdn.com/kf/A7a9e8ba9d0ee48089a75084483e264beq.png')" }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-10 left-10 text-white space-y-4">
            <h3 className="text-4xl font-black">Online Water Analyzers</h3>
            <p className="text-gray-200 text-lg max-w-sm font-medium">COD, Ammonia, TP, Chlorine, and Multi-parameter stations for high-end projects.</p>
            <Button className="bg-white text-primary hover:bg-accent hover:text-white font-black px-8 h-12 rounded-full transition-colors duration-300">
              View All Analyzers
            </Button>
          </div>
        </div>

        <div className="grid grid-rows-2 gap-8">
          <div className="relative group rounded-[40px] overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-500">
            <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-1000" 
              style={{ backgroundImage: "url('https://sc01.alicdn.com/kf/Ae5c0632e9c5f443fa1c6e6590e009f2cD.png')" }} 
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
            <div className="absolute inset-0 flex items-center justify-center text-white text-center p-6">
              <div>
                <h3 className="text-2xl font-black mb-2">Digital Probes & Sensors</h3>
                <p className="text-sm font-bold text-gray-200 mb-4 opacity-0 group-hover:opacity-100 transition-opacity">Precision digital sensing with RS485/Modbus</p>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-bold rounded-full">
                  Browse Sensors
                </Button>
              </div>
            </div>
          </div>
          <div className="relative group rounded-[40px] overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-500">
            <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-1000" 
              style={{ backgroundImage: "url('https://sc01.alicdn.com/kf/Aa3b21199cd064c9fa3fd46e9d5235d134.png')" }} 
            />
             <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
            <div className="absolute inset-0 flex items-center justify-center text-white text-center p-6">
              <div>
                <h3 className="text-2xl font-black mb-2">Integrated Monitoring Boxes</h3>
                <p className="text-sm font-bold text-gray-200 mb-4 opacity-0 group-hover:opacity-100 transition-opacity">Plug-and-play cabinets for field monitoring</p>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-bold rounded-full">
                  Explore Systems
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const SolutionsGrid = () => (
  <section id="solutions" className="py-24 bg-white">
    <div className="container mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="text-primary font-black tracking-widest uppercase text-sm">Industrial Expertise</div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">Solutions Built for Water Reality</h2>
          <div className="grid gap-6">
            {[
              { title: "Municipal Water Supply", desc: "Reliable monitoring for intake, process, and clear water discharge.", icon: Waves },
              { title: "Wastewater Treatment", desc: "Tough sensors for aeration tanks and final discharge compliance.", icon: Zap },
              { title: "Aquaculture Safety", desc: "Real-time DO and Ammonia monitoring for high-density fish farms.", icon: ShieldCheck },
              { title: "Environmental Monitoring", desc: "Autonomous stations for river, lake, and surface water protection.", icon: Globe },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 p-6 rounded-3xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                <div className="text-primary group-hover:scale-125 transition-transform duration-300 shrink-0">
                  <item.icon size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-gray-500 text-sm font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative rounded-[50px] overflow-hidden shadow-2xl h-[600px]">
          <img 
            src="https://sc01.alicdn.com/kf/Ab03188199d8b4800bdf667dd81ec73ecH.png" 
            alt="PLC SCADA System" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent" />
        </div>
      </div>
    </div>
  </section>
);

const AboutCompact = () => (
  <section id="about" className="py-24 bg-primary text-white overflow-hidden relative">
    <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
      <div className="relative z-10 space-y-8">
        <h2 className="text-4xl lg:text-5xl font-black leading-tight">Project-Ready Engineering Capability</h2>
        <p className="text-primary-foreground/80 text-xl font-medium">
          More than just an instrument supplier. FUNEL® provides full-cycle support from sampling point design to PLC control and global logistics.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {["OEM/ODM Design", "Technical Support", "System Integration", "Rapid Shipment"].map((tag, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/10 p-4 rounded-2xl border border-white/10 font-bold">
              <CheckCircle2 size={20} className="text-accent" />
              <span>{tag}</span>
            </div>
          ))}
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-white font-black px-10 h-14 rounded-2xl text-lg">
          Our Company Story
        </Button>
      </div>
      <div className="relative">
        <div className="absolute -inset-24 bg-accent/20 rounded-full blur-[120px]" />
        <img 
          src="https://sc01.alicdn.com/kf/A407492db480e47b9b4c242860e078526J.png" 
          alt="Factory" 
          className="relative rounded-3xl shadow-2xl border border-white/10 transform -rotate-3 hover:rotate-0 transition-transform duration-700"
        />
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-[#050a09] pt-20 pb-10 text-gray-400 px-6">
    <div className="container mx-auto grid md:grid-cols-4 gap-12 mb-16">
      <div className="col-span-2 space-y-6">
        <img 
          src="https://sc01.alicdn.com/kf/Abeefe2fc62fe493e9b8a2a7f7c9e5e36c.png" 
          alt="FUNEL" 
          className="h-12 w-auto brightness-200 grayscale"
        />
        <p className="max-w-md font-medium">
          FUNEL® is a specialized manufacturer and integrator of industrial online water quality analysis systems. We bridge the gap between high-precision instruments and real-world project automation.
        </p>
      </div>
      <div className="space-y-4">
        <h4 className="text-white font-black uppercase tracking-widest text-sm">Quick Links</h4>
        <div className="flex flex-col gap-2 font-bold text-sm">
          <a href="#" className="hover:text-white">Alibaba Store</a>
          <a href="#" className="hover:text-white">LinkedIn Profile</a>
          <a href="#" className="hover:text-white">Product Catalog</a>
          <a href="#" className="hover:text-white">Support Center</a>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-white font-black uppercase tracking-widest text-sm">Contact Info</h4>
        <div className="flex flex-col gap-2 font-bold text-sm text-gray-200">
          <p>WhatsApp: +86 15606523212</p>
          <p>Email: Claire@funel-sensor.com</p>
          <p>Hangzhou, China</p>
        </div>
      </div>
    </div>
    <div className="container mx-auto pt-8 border-t border-white/5 text-center text-xs font-bold uppercase tracking-widest opacity-40">
      © {new Date().getFullYear()} FUNEL SENSOR. All Rights Reserved.
    </div>
  </footer>
);

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Nav />
      <main>
        <Hero />
        <TrustStats />
        <Categories />
        <SolutionsGrid />
        <AboutCompact />
      </main>
      <Footer />
      
      {/* Floating Inquiry Button */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4">
        <a 
          href="https://wa.me/8615606523212" 
          target="_blank"
          className="bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 relative group"
        >
          <MessageCircle size={28} />
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            Chat on WhatsApp
          </span>
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
        </a>
      </div>
    </div>
  );
}
