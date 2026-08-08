import React, { useState } from 'react';
import { BookOpen, GraduationCap, Users, Sparkles, Clock, Download, Award, TrendingUp, Target, ChevronRight, X, Globe } from 'lucide-react';

const Education = ({ content, language = 'ro' }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState(null);

  // Sample data for demonstration
  const defaultContent = {
    ro: {
      title: "Educație de Calitate",
      description: "Programe educaționale moderne adaptate fiecărui nivel de studiu",
      downloadBrochure: "Descarcă Broșura",
      viewDetails: "Vezi Detalii",
      close: "Închide",
      weeklyHours: "ore/săpt",
      students: "Elevi",
      successRate: "Rata Succes",
      highlights: "Puncte Forte",
      curriculum: "Curriculum",
      orientation: "Orientare",
      optional: "Opționale",
      levels: [
        {
          icon: "BookOpen",
          title: "Gimnaziu",
          grades: "Clasele 5-8",
          description: "Program educațional pentru gimnaziu cu focus pe discipline fundamentale și dezvoltare personală",
          schedule: "Luni-Vineri, 8:00-14:00",
          brochureUrl: "#",
          specializations: [
            {
              name: "Program General Gimnazial",
              imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
              weeklyHours: "30",
              students: "25-30",
              successRate: "94%",
              description: "Program educațional complet pentru ciclul gimnazial, care combină disciplinele fundamentale cu activități practice și dezvoltarea competențelor cheie pentru pregătirea către liceu",
              orientation: "Formare completă și echilibrată pentru tranziția către liceu și dezvoltarea personală a elevilor",
              highlights: ["Discipline Fundamentale", "Activități Extracurriculare", "Consiliere Școlară", "Pregătire Evaluare Națională", "Laboratoare Interactive", "Educație Digitală", "Sport și Artă", "Competiții Școlare"],
              subjects: ["Matematică", "Limba Română", "Limba Engleză", "Istorie", "Geografie", "Biologie", "Fizică", "Chimie", "Educație Fizică", "Educație Tehnologică", "Arte", "Muzică"],
              optionalSubjects: ["Informatică", "Limba Franceză", "Limba Germană", "Robotică", "Teatru", "Dans"],
              brochureUrl: "#"
            }
          ]
        },
        {
          icon: "GraduationCap",
          title: "Liceu",
          grades: "Clasele 9-12",
          description: "Program de liceu cu profiluri diverse pentru cariere de succes",
          schedule: "Luni-Vineri, 8:00-15:00",
          brochureUrl: "#",
          specializations: [
            {
              name: "Real - Matematică-Informatică",
              imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
              weeklyHours: "32",
              students: "28-30",
              successRate: "97%",
              description: "Profil intensiv pentru viitorii specialiști în tehnologie și știință",
              orientation: "Pregătire pentru facultăți de top în domeniul tehnic",
              highlights: ["Performanță Academică", "Olimpiade", "Hackathons", "Cercetare"],
              subjects: ["Matematică", "Informatică", "Fizică", "Limba Română", "Limba Engleză", "Educație Fizică"],
              optionalSubjects: ["Machine Learning", "Web Development", "Inteligență Artificială"],
              brochureUrl: "#"
            },
            {
              name: "Științe Naturale",
              imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400",
              weeklyHours: "30",
              students: "24-28",
              successRate: "95%",
              description: "Explorarea aprofundată a științelor naturale prin experimente și cercetare",
              orientation: "Pregătire pentru cariere în medicină, biologie și chimie",
              highlights: ["Laboratoare Avansate", "Cercetare Științifică", "Parteneriate Universitare", "Olimpiade"],
              subjects: ["Biologie", "Chimie", "Fizică", "Matematică", "Limba Română", "Limba Engleză"],
              optionalSubjects: ["Biochimie", "Anatomie", "Ecologie"],
              brochureUrl: "#"
            },
            {
              name: "Filologie - Limbi Moderne",
              imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
              weeklyHours: "31",
              students: "25-30",
              successRate: "96%",
              description: "Program dedicat studiului limbilor străine și comunicării interculturale",
              orientation: "Dezvoltarea competențelor lingvistice avansate și pregătire pentru cariere internaționale",
              highlights: ["Limbi Străine Intensive", "Schimburi Internaționale", "Certificări Cambridge", "Dezbatere"],
              subjects: ["Limba Română", "Limba Engleză", "Limba Franceză", "Istorie", "Geografie", "Limba Latină"],
              optionalSubjects: ["Limba Germană", "Limba Spaniolă", "Literatura Universală", "Teatru"],
              brochureUrl: "#"
            },
            {
              name: "Științe Sociale",
              imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
              weeklyHours: "30",
              students: "22-28",
              successRate: "94%",
              description: "Înțelegerea profundă a societății, economiei și relațiilor internaționale",
              orientation: "Pregătire pentru cariere în drept, economie, relații internaționale și administrație",
              highlights: ["Proiecte Sociale", "Simulări Parlamentare", "Economie Aplicată", "Educație Juridică"],
              subjects: ["Istorie", "Geografie", "Economie", "Sociologie", "Logică", "Limba Română", "Limba Engleză"],
              optionalSubjects: ["Psihologie", "Filosofie", "Relații Internaționale", "Drept"],
              brochureUrl: "#"
            }
          ]
        }
      ]
    }
  };

  const text = (content && content[language]) || (content && content.ro) || defaultContent.ro;
  const currentLevel = text.levels[activeTab];

  const iconMap = {
    BookOpen: BookOpen,
    GraduationCap: GraduationCap,
    Users: Users
  };

  const getGreenShade = (index) => {
    const shades = [
      { bg: 'bg-emerald-700', border: 'border-emerald-600', accent: 'bg-emerald-600', hover: 'hover:bg-emerald-800', light: 'bg-emerald-50' },
      { bg: 'bg-green-700', border: 'border-green-600', accent: 'bg-green-600', hover: 'hover:bg-green-800', light: 'bg-green-50' },
      { bg: 'bg-teal-700', border: 'border-teal-600', accent: 'bg-teal-600', hover: 'hover:bg-teal-800', light: 'bg-teal-50' },
      { bg: 'bg-emerald-800', border: 'border-emerald-700', accent: 'bg-emerald-700', hover: 'hover:bg-emerald-900', light: 'bg-emerald-50' }
    ];
    return shades[index % shades.length];
  };

  const handleDownload = (url, filename) => {
    // Different URLs for different tabs
    const brochureUrls = {
      0: 'https://example.com/brosura-gimnaziu.pdf',  // Gimnaziu
      1: 'https://example.com/brosura-liceu.pdf'       // Liceu
    };
    
    const downloadUrl = brochureUrls[activeTab] || url;
    window.open(downloadUrl, '_blank');
  };

  return (
    <section id="education" className="py-12 md:py-20 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-4 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Programele noastre
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 px-4">
            {text.title}
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-4">{text.description}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mb-8 md:mb-12 px-2">
          {text.levels.map((level, idx) => {
            const Icon = iconMap[level.icon];
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform ${
                  activeTab === idx
                    ? 'bg-emerald-700 text-white shadow-lg scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-50 shadow-md hover:scale-102'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm sm:text-base">{level.title}</span>
              </button>
            );
          })}
        </div>

        {/* Level Info Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 mb-6 md:mb-10 shadow-md border border-slate-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{currentLevel.grades}</h3>
              <p className="text-slate-600 mb-3 text-base md:text-lg">{currentLevel.description}</p>
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-5 h-5" />
                <span className="font-medium text-sm sm:text-base">{currentLevel.schedule}</span>
              </div>
            </div>
            <button 
              onClick={() => handleDownload(currentLevel.brochureUrl, 'level-brochure.pdf')}
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              <span className="text-sm sm:text-base">{text.downloadBrochure}</span>
            </button>
          </div>
        </div>

        {/* Specializations Grid */}
        <div className={`grid gap-4 md:gap-6 ${
          currentLevel.specializations.length === 1 
            ? 'grid-cols-1 max-w-4xl mx-auto' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4'
        }`}>
          {currentLevel.specializations.map((spec, idx) => {
            const colors = getGreenShade(idx);
            const isSingleCard = currentLevel.specializations.length === 1;
            return (
              <div
                key={idx}
                className={`group relative overflow-hidden rounded-2xl border-2 ${colors.border} transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-white ${
                  isSingleCard ? 'flex flex-col lg:flex-row' : ''
                }`}
              >
                {/* Image Header */}
                <div className={`relative overflow-hidden ${
                  isSingleCard ? 'h-64 lg:h-auto lg:w-2/5' : 'h-40 sm:h-48'
                }`}>
                  <img
                    src={spec.imageUrl}
                    alt={spec.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 ${colors.bg} opacity-80 group-hover:opacity-75 transition-opacity duration-300`}></div>
                  <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <Award className="w-6 sm:w-7 h-6 sm:h-7 text-white/90 animate-pulse" />
                      <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/25 backdrop-blur-md rounded-lg text-white text-xs font-bold border border-white/30">
                        {spec.weeklyHours} {text.weeklyHours}
                      </span>
                    </div>
                    <h4 className={`text-white font-bold leading-tight drop-shadow-lg ${
                      isSingleCard ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
                    }`}>
                      {spec.name}
                    </h4>
                  </div>
                </div>

                {/* Card Content */}
                <div className={`p-4 sm:p-5 ${isSingleCard ? 'lg:w-3/5 flex flex-col' : ''}`}>
                  <p className={`text-slate-600 leading-relaxed mb-4 ${
                    isSingleCard ? 'text-base' : 'text-sm line-clamp-3'
                  }`}>
                    {spec.description}
                  </p>

                  {/* Stats Grid */}
                  <div className={`grid gap-2 mb-4 ${
                    isSingleCard ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'
                  }`}>
                    <div className={`${colors.light} p-2 rounded-lg border ${colors.border}`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Users className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-xs text-slate-500 font-medium">{text.students}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{spec.students}</p>
                    </div>
                    <div className={`${colors.light} p-2 rounded-lg border ${colors.border}`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-xs text-slate-500 font-medium">{text.successRate}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{spec.successRate}</p>
                    </div>
                    {isSingleCard && (
                      <>
                        <div className={`${colors.light} p-2 rounded-lg border ${colors.border}`}>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-xs text-slate-500 font-medium">Ore/Săpt</span>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{spec.weeklyHours}</p>
                        </div>
                        <div className={`${colors.light} p-2 rounded-lg border ${colors.border}`}>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-xs text-slate-500 font-medium">Materii</span>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{spec.subjects.length}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Orientation */}
                  <div className="flex items-start gap-2 text-xs text-slate-600 mb-4 pb-4 border-b border-slate-200">
                    <Target className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="line-clamp-2 leading-relaxed">{spec.orientation}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedSpec(spec);
                        setShowModal(true);
                      }}
                      className={`flex-1 py-2.5 ${colors.bg} ${colors.hover} text-white rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-1.5 shadow-md`}
                    >
                      {text.viewDetails}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDownload(spec.brochureUrl, `${spec.name}.pdf`)}
                      className={`p-2.5 ${colors.accent} ${colors.hover} text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {showModal && selectedSpec && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl transform animate-slideUp">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-700 to-green-700 p-4 sm:p-6 flex items-center justify-between sticky top-0 z-10">
                <div className="text-white flex-1 pr-4">
                  <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{selectedSpec.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-emerald-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 sm:w-4 h-3 sm:h-4" />
                      {selectedSpec.weeklyHours} {text.weeklyHours}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 sm:w-4 h-3 sm:h-4" />
                      {selectedSpec.students} {text.students}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4" />
                      {selectedSpec.successRate}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white flex-shrink-0"
                >
                  <X className="w-5 sm:w-6 h-5 sm:h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6">
                {/* Highlights */}
                <div className="mb-6">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    {text.highlights}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedSpec.highlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-sm text-slate-700"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0"></div>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Curriculum */}
                <div className="mb-6">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    {text.curriculum}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedSpec.subjects.map((subject, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0"></div>
                        <span>{subject}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orientation Detail */}
                <div className="mb-6 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <h4 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {text.orientation}
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedSpec.orientation}</p>
                </div>

                {/* Optional Subjects */}
                <div className="mb-6">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-600" />
                    {text.optional}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSpec.optionalSubjects.map((optional, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        {optional}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleDownload(selectedSpec.brochureUrl, `${selectedSpec.name}.pdf`)}
                    className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    {text.downloadBrochure}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors"
                  >
                    {text.close}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </section>
  );
};

export default Education;