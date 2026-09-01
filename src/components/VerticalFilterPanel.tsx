import React from 'react';
import { Calendar, Award, Lightbulb, Users, Code, Beaker, Globe, Filter } from 'lucide-react';

interface VerticalFilterPanelProps {
  language: 'ro' | 'en';
  isOpen: boolean;
  onClose: () => void;
  
  // Academic Results filters
  selectedYear: string;
  onYearChange: (year: string) => void;
  availableYears: string[];
  
  // Projects filters
  selectedProjectCategory: string;
  onProjectCategoryChange: (category: string) => void;
  
  // News filters (if needed)
  selectedNewsCategory?: string;
  onNewsCategoryChange?: (category: string) => void;
}

const VerticalFilterPanel: React.FC<VerticalFilterPanelProps> = ({
  language,
  isOpen,
  onClose,
  selectedYear,
  onYearChange,
  availableYears,
  selectedProjectCategory,
  onProjectCategoryChange,
  selectedNewsCategory,
  onNewsCategoryChange
}) => {
  const content = {
    ro: {
      title: 'Filtre',
      academicResults: 'Rezultate Academice',
      selectYear: 'Selectează Anul',
      projects: 'Proiecte',
      projectCategories: [
        { id: 'all', name: 'Toate', icon: Lightbulb },
        { id: 'science', name: 'Științe', icon: Beaker },
        { id: 'technology', name: 'Tehnologie', icon: Code },
        { id: 'international', name: 'Internațional', icon: Globe }
      ],
      news: 'Știri și Anunțuri',
      newsCategories: [
        { id: 'all', name: 'Toate' },
        { id: 'events', name: 'Evenimente' },
        { id: 'academic', name: 'Academic' },
        { id: 'achievements', name: 'Performanțe' }
      ]
    },
    en: {
      title: 'Filters',
      academicResults: 'Academic Results',
      selectYear: 'Select Year',
      projects: 'Projects',
      projectCategories: [
        { id: 'all', name: 'All', icon: Lightbulb },
        { id: 'science', name: 'Science', icon: Beaker },
        { id: 'technology', name: 'Technology', icon: Code },
        { id: 'international', name: 'International', icon: Globe }
      ],
      news: 'News & Announcements',
      newsCategories: [
        { id: 'all', name: 'All' },
        { id: 'events', name: 'Events' },
        { id: 'academic', name: 'Academic' },
        { id: 'achievements', name: 'Achievements' }
      ]
    }
  };

  const text = content[language];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Filter Panel */}
      <div className={`vertical-filter-panel ${isOpen ? 'mobile-open' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-blue-900)' }}>
            <Filter className="w-5 h-5 inline mr-2" />
            {text.title}
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-full"
            style={{ 
              background: 'var(--color-blue-100)',
              color: 'var(--color-blue-700)'
            }}
          >
            ×
          </button>
        </div>

        {/* Academic Results Year Filter - Prominent */}
        <div className="year-filter-prominent">
          <h3>
            <Calendar className="w-4 h-4 inline mr-2" />
            {text.academicResults}
          </h3>
          <p className="text-xs mb-3" style={{ color: 'var(--color-blue-600)' }}>
            {text.selectYear}
          </p>
          <div className="year-filter-grid">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => onYearChange(year)}
                className={`year-button ${selectedYear === year ? 'active' : ''}`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Filter */}
        <div className="filter-section">
          <h3>
            <Lightbulb className="w-4 h-4 inline mr-2" />
            {text.projects}
          </h3>
          {text.projectCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onProjectCategoryChange(category.id)}
              className={`filter-button ${selectedProjectCategory === category.id ? 'active' : ''}`}
            >
              <category.icon className="w-4 h-4 inline mr-2" />
              {category.name}
            </button>
          ))}
        </div>

        {/* News Filter (if provided) */}
        {selectedNewsCategory !== undefined && onNewsCategoryChange && (
          <div className="filter-section">
            <h3>
              <Award className="w-4 h-4 inline mr-2" />
              {text.news}
            </h3>
            {text.newsCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => onNewsCategoryChange(category.id)}
                className={`filter-button ${selectedNewsCategory === category.id ? 'active' : ''}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-8 p-4 rounded-lg" style={{ 
          background: 'var(--color-blue-50)',
          border: `1px solid var(--color-blue-200)`
        }}>
          <p className="text-xs" style={{ color: 'var(--color-blue-700)' }}>
            {language === 'ro' 
              ? 'Folosește filtrele pentru a naviga prin conținutul academic și proiectele școlii.'
              : 'Use filters to navigate through academic content and school projects.'
            }
          </p>
        </div>
      </div>
    </>
  );
};

export default VerticalFilterPanel;