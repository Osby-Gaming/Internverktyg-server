export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { err } = await searchParams;

    return (
        <div>
            <p className="mb-6 text-4xl">{err ?? "Något gick fel :("}</p>
            <div className="flex justify-center">
                <button>Återgå</button>
            </div>
        </div>
    );
}
