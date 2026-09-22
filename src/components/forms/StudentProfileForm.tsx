import { useStudentProfileFormStore } from '@/store/Student/useStudentProfileFormStore'
import React, { useEffect, useState } from 'react'
import DropdownPosition from '../ui/Student/DropdownPosition'

type Props = {
    formRef: React.RefObject<HTMLFormElement | null>
};

const StudentProfileForm: React.FC<Props> = ({ formRef }) => {

    const [isValidFirstNameStudent, setIsValidFirstNameStudent] = useState<boolean | null>(null)
    const [isValidLastNameStudent, setIsValidLastNameStudent] = useState<boolean | null>(null)

    const {
        firstNameStudentInput,
        lastNameStudentInput,
        searchStudentTerm,
        studentTeam,
        setLastNameStudentInput,
        setFirstNameStudentInput,
        setSearchStudentTerm,
        setStudentTeam
    } = useStudentProfileFormStore()

    const handleSubmitProfile = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const StudentProfileInformation = {
            firstNameStudentInput: firstNameStudentInput,
            lastNameStudentInput: lastNameStudentInput,
            searchStudentTerm: searchStudentTerm,
            studentTeam: studentTeam
        }
        setFirstNameStudentInput('')
        setLastNameStudentInput('')
        setSearchStudentTerm('')
        setStudentTeam('')
    }

    useEffect(() => {
        if (firstNameStudentInput) {
            const NameRegex = /^[A-Z][a-z]+$/
            setIsValidFirstNameStudent(NameRegex.test(firstNameStudentInput));
        } else {
            setIsValidFirstNameStudent(null)
        }
    }, [firstNameStudentInput]);

    useEffect(() => {
        if (lastNameStudentInput) {
            const lastNameRegex = /^[A-Z][a-z]+$/
            setIsValidLastNameStudent(lastNameRegex.test(lastNameStudentInput));
        } else {
            setIsValidLastNameStudent(null)
        }
    }, [lastNameStudentInput]);

    return (
        <>
            <form className="flex-1 p-6 flex flex-col gap-y-3" onSubmit={handleSubmitProfile} ref={formRef}>
                <div>
                    <label className="text-sm font-medium text-gray-700 ml-3">Nome</label>
                    <input
                        type="text"
                        placeholder="Nome"
                        className="w-full mt-1 p-3 border border-[#6D6D6D] rounded-md outline-0 focus:border-[#0092BA] text-black"
                        value={firstNameStudentInput}
                        onChange={(e) => setFirstNameStudentInput(e.target.value)}
                    />
                </div>
                {firstNameStudentInput && !isValidFirstNameStudent && (
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
                        value={lastNameStudentInput}
                        onChange={(e) => setLastNameStudentInput(e.target.value)}
                    />
                </div>
                {lastNameStudentInput && !isValidLastNameStudent && (
                    <p id="emailInvalidLogin" className="text-xs text-red-600 mt-1">
                        Por favor, insira um sobrenome válido
                    </p>
                )}

                <div className='w-full'>
                    <DropdownPosition />
                </div>

                <div>
                    <label className="w-full text-sm font-medium text-gray-700 ml-3">Equipe (Opcional)</label>
                    <input
                        type="text"
                        placeholder="Nome da equipe"
                        className="w-full mt-1 p-3 border border-[#6D6D6D] rounded-md outline-0 focus:border-[#0092BA] text-black"
                        value={studentTeam}
                        onChange={(e) => setStudentTeam(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1 ml-3">Caso participe do Pipoca Ágil</p>
                </div>
            </form>
        </>
    )
}

export default StudentProfileForm;