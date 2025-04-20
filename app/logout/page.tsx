import LogoutButton from "./LogoutButton";

export default function Page() {
    return (
        <div>
            <p className="mb-6">Säker på att du vill logga ut?</p>
            <div className="flex justify-center">
                <LogoutButton />
            </div>
        </div>
    );
}
