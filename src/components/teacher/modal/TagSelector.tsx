import React from 'react';

type TagCategory = {
  title: string;
  tags: string[];
};

interface TagSelectorProps {
  tagCategories: TagCategory[];
  selectedTags: string[];
  maxTags: number;
  toggleTag: (tag: string) => void;
}

export default function TagSelector({ tagCategories, selectedTags, maxTags, toggleTag }: TagSelectorProps) {
  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-sm mt-6">
      <p className="text-xl font-semibold text-[#4B5563] mb-4">Categorias e Tags sugeridas</p>
      {tagCategories.map((category) => (
        <div key={category.title} className="mb-6">
          <p className="font-medium text-[#374151] text-[15px] mb-2">{category.title}</p>
          <div className="flex flex-wrap gap-2">
            {category.tags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              const isDisabled = !isSelected && selectedTags.length >= maxTags;

              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  disabled={isDisabled}
                  className={`px-3 py-1 rounded-full text-sm border transition-all duration-200
                    ${isSelected
                      ? 'bg-[#0092BA] text-white border-[#0092BA] cursor-pointer'
                      : isDisabled
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-[#0092BA] border-[#0092BA] hover:bg-[#f0f9fb] cursor-pointer'}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-6">
        <p className="text-[16px] font-medium text-[#4B5563] mb-2">
          Tags selecionadas ({selectedTags.length} de {maxTags})
        </p>
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="bg-[#0092BA] text-white text-sm px-3 py-1 rounded-full flex items-center gap-2"
            >
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="text-white font-bold hover:text-gray-200 cursor-pointer"
                type="button"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
