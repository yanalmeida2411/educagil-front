import { useTeacherProfileFormStore } from '@/store/Teacher/useTeacherProfileFormStore'
import React, { useEffect, useState } from 'react'
import DropdownSpecialty from '../ui/Teacher/DropdownSpecialty'

type Props = {
    formRef: React.RefObject<HTMLFormElement | null>
};

const TeacherProfileForm: React.FC<Props> = ({ formRef }) => {

    const [isValidLinkedin, setIsValidLinkedin] = useState<boolean | null>(null)
    const [isValidFirstName, setIsValidFirstName] = useState<boolean | null>(null)
    const [isValidLastName, setIsValidLastName] = useState<boolean | null>(null)

    const {
        firstNameInput,
        lastNameInput,
        linkedin,
        team,
        searchTerm,
        setFirstNameInput,
        setLastNameInput,
        setLinkedin,
        setTeam,
        setSearchTerm
    } = useTeacherProfileFormStore()

    const handleSubmitProfile = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const profileInformation = {
            firstNameInput: firstNameInput,
            lastNameInput: lastNameInput,
            searchTerm: searchTerm,
            linkedin: linkedin,
            team: team
        }
        setFirstNameInput('')
        setLastNameInput('')
        setSearchTerm('')
        setLinkedin('')
        setTeam('')
    }


    useEffect(() => {
        if (linkedin) {
            const linkedinRegex = /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/
            setIsValidLinkedin(linkedinRegex.test(linkedin));
        } else {
            setIsValidLinkedin(null)
        }
    }, [linkedin]);

    useEffect(() => {
        if (firstNameInput) {
            const NameRegex = /^[A-Z][a-z]+$/
            setIsValidFirstName(NameRegex.test(firstNameInput));
        } else {
            setIsValidFirstName(null)
        }
    }, [firstNameInput]);

    useEffect(() => {
        if (lastNameInput) {
            const lastNameRegex = /^[A-Z][a-z]+$/
            setIsValidLastName(lastNameRegex.test(lastNameInput));
        } else {
            setIsValidLastName(null)
        }
    }, [lastNameInput]);



    return (
        <>
            <form className="flex-1 p-6 flex flex-col gap-y-3" onSubmit={handleSubmitProfile} ref={formRef}>
                <div>
                    <label className="text-sm font-medium text-gray-700 ml-3">Nome</label>
                    <input
                        type="text"
                        placeholder="Nome"
                        className="w-full mt-1 p-3 border border-[#6D6D6D] rounded-md outline-0 focus:border-[#0092BA] text-black"
                        value={firstNameInput}
                        onChange={(e) => setFirstNameInput(e.target.value)}
                    />
                </div>
                {firstNameInput && !isValidFirstName && (
                    <p id="emailInvalidLogin" className="text-xs text-red-600 mt-1">
                        Por favor, insira um nome válido
                    </p>
                )}
                <div>
                    <label className="text-sm font-medium text-gray-700 ml-3">Sobrenome</label>
                    <input
                        type="text"
                        placeholder="Sobrenome"
                        className="w-full mt-1 p-3 border border-[#6D6D6D] rounded-md outline-0 focus:border-[#0092BA] text-black"
                        value={lastNameInput}
                        onChange={(e) => setLastNameInput(e.target.value)}
                    />
                </div>
                {lastNameInput && !isValidLastName && (
                    <p id="emailInvalidLogin" className="text-xs text-red-600 mt-1">
                        Por favor, insira um sobrenome válido
                    </p>
                )}

                <div>
                    <DropdownSpecialty />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 ml-3">Linkedin</label>
                    <input
                        type="text"
                        placeholder="www.linkedin.com/in"
                        className="w-full mt-1 p-3 border border-[#6D6D6D] rounded-md outline-0 focus:border-[#0092BA] text-black"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                    />
                </div>
                {linkedin && !isValidLinkedin && (
                    <p id="emailInvalidLogin" className="text-xs text-red-600 mt-1">
                        Por favor, insira uma URL válida
                    </p>
                )}
                <div>
                    <label className="w-full text-sm font-medium text-gray-700 ml-3">Equipe (Opcional)</label>
                    <input
                        type="text"
                        placeholder="Nome da equipe"
                        className="w-full mt-1 p-3 border border-[#6D6D6D] rounded-md outline-0 focus:border-[#0092BA] text-black"
                        value={team}
                        onChange={(e) => setTeam(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1 ml-3">Caso participe do Pipoca Ágil</p>
                </div>
            </form>
        </>
    )
}

export default TeacherProfileForm