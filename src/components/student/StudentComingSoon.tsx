import { useUserInfoFromCookies } from '@/hooks/useUserFromCookies';


export default function StudentComingSoon() {

    const { full_name} = useUserInfoFromCookies();

    return (

        <main className="flex flex-col  px-4  font-sans font-semibold text-center w-130">
            <h2 className="text-2xl">
                Ola {full_name}, em breve você poderá explorar um mundo novo</h2>
            <p className="font-light text-lg mt-4 ">
                Cheio de descobertas, oportunidades e conhecimento ao seu alcance, o universo professor-aluno está pronto para surpreender você.
            </p>
        </main>

    );
}