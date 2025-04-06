import * as frontend from "appwrite";
import * as backend from "node-appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';

if (!DATABASE_ID) {
    throw new Error("Missing required environment variable NEXT_PUBLIC_APPWRITE_DATABASE_ID ");
}

export class Appwrite_Common {
    getClient: (() => frontend.Client) | (() => backend.Client);
    Databases: typeof frontend.Databases | typeof backend.Databases;

    constructor(appwriteClientGetter: (() => frontend.Client) | (() => backend.Client), appwriteDatabases: typeof frontend.Databases | typeof backend.Databases) {
        this.getClient = appwriteClientGetter;
        this.Databases = appwriteDatabases;
    }

    async listOneDocument(collectionID: string, queries: string[]) {
        const response = await this.listDocuments(collectionID, queries);
    
        const responseCopy = JSON.parse(JSON.stringify(response)) as {
            status: number;
            message: string;
            data: frontend.Models.Document;
            error: null;
        } | {
            status: any;
            message: any;
            data: null;
            error: any;
        }
    
        if (response.data !== null) {
            responseCopy.data = response.data[0]
        }
    
        return responseCopy;
    }

    async deleteDocument(collectionId: string, documentId: string) {
        try {
            //@ts-expect-error
            const databases = new this.Databases(this.getClient());
    
            const result = await databases.deleteDocument(
                DATABASE_ID,
                collectionId,
                documentId
            );
    
            return {
                status: 200,
                message: "Retrieved successfully",
                data: result,
                error: null
            };
        } catch (error: any) {
            if (error.name && error.name === 'AppwriteException') {
                return {
                    status: error.code,
                    message: error.response.message,
                    data: null,
                    error
                }
            }
    
            return {
                status: 500,
                message: "Document not retrieved",
                data: null,
                error
            };
        }
    }

    async getDocument(collectionId: string, documentId: string, queries?: string[]) {
        try {
            //@ts-expect-error
            const databases = new this.Databases(this.getClient());
    
            const result = await databases.getDocument(
                DATABASE_ID,
                collectionId,
                documentId,
                queries
            );
    
            return {
                status: 200,
                message: "Retrieved successfully",
                data: result,
                error: null
            };
        } catch (error: any) {
            if (error.name && error.name === 'AppwriteException') {
                return {
                    status: error.code,
                    message: error.response.message,
                    data: null,
                    error
                }
            }
    
            return {
                status: 500,
                message: "Document not retrieved",
                data: null,
                error
            };
        }
    }

    async listDocuments(collectionID: string, queries: string[]) {
        try {
            //@ts-expect-error
            const databases = new this.Databases(this.getClient());
    
            const result = await databases.listDocuments(
                DATABASE_ID,
                collectionID,
                queries
            );
    
            return {
                status: 200,
                message: "Retrieved successfully",
                data: result.documents,
                error: null
            };
        } catch (error: any) {
            if (error.name && error.name === 'AppwriteException') {
                return {
                    status: error.code,
                    message: error.response.message,
                    data: null,
                    error
                }
            }
    
            return {
                status: 500,
                message: "Document not retrieved",
                data: null,
                error
            };
        }
    }

    async insertDocument(collectionID: string, data: Record<string, any>) {
        try {
            //@ts-expect-error
            const databases = new this.Databases(this.getClient());
    
            const result = await databases.createDocument(DATABASE_ID, collectionID, frontend.ID.unique(), data);
    
            return {
                status: 200,
                message: "Inserted successfully",
                data: result,
                error: null
            };
        } catch (error: any) {
            if (error.name && error.name === 'AppwriteException') {
                return {
                    status: error.code,
                    message: error.response.message,
                    data: null,
                    error
                }
            }
    
            return {
                status: 500,
                message: "Document not inserted",
                data: null,
                error
            };
        }
    }

    async updateDocument(collectionId: string, documentId: string, data: Record<string, any>) {
        try {
            //@ts-expect-error
            const databases = new this.Databases(this.getClient());
    
            const result = await databases.updateDocument(DATABASE_ID, collectionId, documentId, data);
    
            return {
                status: 200,
                message: "Updated successfully",
                data: result,
                error: null
            };
        } catch (error: any) {
            if (error.name && error.name === 'AppwriteException') {
                return {
                    status: error.code,
                    message: error.response.message,
                    data: null,
                    error
                }
            }
    
            return {
                status: 500,
                message: "Document not updated",
                data: null,
                error
            };
        }
    }
}