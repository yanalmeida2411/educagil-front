import Footer from '@/components/layout/FooterPassword';
import SidebarLoginRegister from '@/components/layout/SidebarLoginRegister';
import Link from 'next/link';

export default function RegisterValid() {

    return (
        <>
            <div className="flex flex-col min-h-screen">
                <SidebarLoginRegister />
                <div className='flex-1 flex flex-col items-center text-center mt-20 gap-y-10 px-4'>
                    <h1 className='text-2xl font-bold'>Bem-vindo à Plataforma EducaÁgil!</h1>
                    <p className='max-w-xl'>
                        Parabéns! Sua conta foi validada com sucesso e agora você faz parte da nossa comunidade
                        que transforma conhecimento em ação.
                        A partir de agora, você tem acesso a uma experiência completa com conteúdos exclusivos,
                        ferramentas interativas e um ambiente feito para impulsionar seu aprendizado de forma ágil,
                        prática e inovadora.
                        Explore nossos recursos, participe das atividades e
                        fique à vontade para tirar o máximo proveito de tudo o que preparamos com carinho para você.
                    </p>
                    <Link 
                    href='/login'
                    className='w-1/3 p-3 rounded-md mb-10 bg-blue-500 cursor-pointer text-white hover:bg-blue-700'>
                        Ir para o login
                    </Link>
                </div>
                <Footer />
            </div>
        </>
    )
}
