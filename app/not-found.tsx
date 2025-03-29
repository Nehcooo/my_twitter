export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center text-white h-screen w-screen">
            <h1 className="text-3xl font-bold">404 | Cette page est introuvable.</h1>
            <a href="/home" className="hover:opacity-70 duration-100 ease-in flex items-center justify-center w-[320px] text-white bg-(--blue) cursor-pointer relative top-5 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                Retourner à la page d'accueil
            </a>
        </div>
    )
}