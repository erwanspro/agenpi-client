import { useState, useRef, useEffect } from 'react';

const MultiSelect = ({ label, options, selected, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // ferme le menu si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (value) => {
        if (selected.includes(value)) {
            onChange(selected.filter(item => item !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const removeOption = (e, value) => {
        e.stopPropagation();
        onChange(selected.filter(item => item !== value));
    };

    // récupère les objets complets des options sélectionnées pour l'affichage
    const selectedItems = options.filter(opt => selected.includes(opt.value));

    return (
        <div className="space-y-1.5 relative group" ref={dropdownRef}>
            <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">
                {label}
            </label>
            
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="min-h-[44px] w-full px-4 py-2 bg-(--bg) border border-(--border) rounded-xl text-(--text-h) focus-within:border-(--accent) focus-within:ring-2 focus-within:ring-(--accent)/20 transition-all cursor-pointer flex flex-wrap gap-2 items-center"
            >
                {selectedItems.length === 0 ? (
                    <span className="text-(--text) opacity-70">{placeholder}</span>
                ) : (
                    selectedItems.map(item => (
                        <span 
                            key={item.value} 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-(--accent)/10 text-(--accent) border border-(--accent)/20"
                        >
                            {item.label}
                            <button 
                                type="button" 
                                onClick={(e) => removeOption(e, item.value)}
                                className="hover:text-red-500 hover:bg-red-500/10 rounded-full p-0.5 transition-colors"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </span>
                    ))
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-(--bg-secondary) border border-(--border) rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                    {options.length === 0 ? (
                        <div className="p-4 text-sm text-(--text) text-center">Aucune option disponible</div>
                    ) : (
                        <ul className="p-2 space-y-1">
                            {options.map((option) => {
                                const isSelected = selected.includes(option.value);
                                return (
                                    <li 
                                        key={option.value}
                                        onClick={() => toggleOption(option.value)}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors ${isSelected ? 'bg-(--accent)/10 text-(--accent)' : 'hover:bg-(--code-bg) text-(--text-h)'}`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-(--accent) border-(--accent) text-white' : 'border-(--border) bg-(--bg)'}`}>
                                            {isSelected && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        {option.label}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;