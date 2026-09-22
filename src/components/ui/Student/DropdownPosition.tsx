'use client';
import { useUserInfoFromCookies } from '@/hooks/useUserFromCookies';
import { useStudentProfileFormStore } from '@/store/Student/useStudentProfileFormStore';
import React, { useState, useRef, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

interface Cargo {
    id: string;
    name: string;
}

interface CargoSelectorProps {
    cargos: Cargo[];
    onSelectCargo: (cargo: Cargo | null) => void;
    selectedCargo: Cargo | null;
}

const CargoSelector: React.FC<CargoSelectorProps> = ({ cargos, onSelectCargo, selectedCargo }) => {

    const {
        searchStudentTerm,
        setSearchStudentTerm
    } = useStudentProfileFormStore()

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);


    const filteredCargos = cargos.filter(cargo =>
        cargo.name.toLowerCase().includes(searchStudentTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (cargo: Cargo) => {
        onSelectCargo(cargo);
        setIsOpen(false);
        setSearchStudentTerm(cargo.name);
    };
  const { full_name, user_type } = useUserInfoFromCookies();

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="relative w-full">
                 {user_type === 'T' &&  <label className="text-sm font-medium text-gray-700 ml-3">Especialidade</label>}
                 {user_type === 'S' &&    <label className="text-sm font-medium text-gray-700 ml-3">Cargo Pretendido</label>}
                <input
                    type="text"
                    placeholder="ex. Product Owner"
                    className="w-full mt-1 p-3 border border-[#6D6D6D] rounded-md outline-0  text-gray-700 focus:border-[#0092BA] "
                    value={searchStudentTerm}
                    onChange={(e) => setSearchStudentTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onClick={() => setIsOpen(true)}
                />

                <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? (
                        <HiChevronUp className="absolute right-0 h-5 w-5 text-gray-500" />
                    ) : (
                        <HiChevronDown className="absolute right-0 h-5 w-5 text-gray-500" />
                    )}
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto p-3">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            placeholder="Pesquisar"
                            className="w-full pl-10 pr-4 py-2 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:border-[#0092BA]"
                            value={searchStudentTerm}
                            onChange={(e) => setSearchStudentTerm(e.target.value)}
                        />
                    </div>
                    {filteredCargos.length === 0 ? (
                        <div className="p-3 text-gray-500">Nenhum cargo encontrado.</div>
                    ) : (
                        <ul>
                            {filteredCargos.map(cargo => (
                                <li
                                    key={cargo.id}
                                    className={` text-gray-500 p-3 cursor-pointer hover:bg-gray-100 ${selectedCargo?.id === cargo.id ? 'bg-blue-50 text-blue-700 font-semibold' : ''}`}
                                    onClick={() => handleSelect(cargo)}
                                >
                                    {cargo.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

const cargos: Cargo[] = [
    { id: '1', name: 'Desenvolvedor' },
    { id: '2', name: 'Product Manager' },
    { id: '3', name: 'Product Owner' },
    { id: '4', name: 'Scrum Master' },
    { id: '5', name: 'UX/UI Designer' },
    { id: '6', name: 'Quality Assurance' },
];

const HomePage: React.FC = () => {
    const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);

    const handleSelectCargo = (cargo: Cargo | null) => {
        setSelectedCargo(cargo);
    };

    return (
        <div className="w-full min-h-full flex items-center justify-center ">
            <div className="w-full">

                <CargoSelector
                    cargos={cargos}
                    onSelectCargo={handleSelectCargo}
                    selectedCargo={selectedCargo}
                />

            </div>
        </div>
    );
};

export default HomePage;