
import SidebarPassowdRecovery from '../../components/layout/SidebarPasswordRecovery'
import Recovery from '../../components/forms/Recovery';
import Footer from '../../components/layout/FooterPassword';
import Return from '../../components/actions/return';


export default function Email_password_recovery() {
    return (

        <section className="max-h-screen  flex flex-col font-sans font-semibold ">
            <SidebarPassowdRecovery />

            <Return />

            <div className='flex  w-full items-center justify-center align-middle  h-dvh max-md:h-auto'>
                <Recovery />
            </div>

            <footer>
                <Footer />
            </footer>
        </section>
    );
}
