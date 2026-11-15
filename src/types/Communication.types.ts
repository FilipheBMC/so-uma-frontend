// Creating interfaces to communication bettwen the server and front

// Criando o responser

// Criando interface para matérias e tópicos
export interface PreparedSubject {
    materia: string,
    topics: string[]
    amountQuestions: number
}

// Tratando da paginação do dos meus assuntos
export interface pagination {
    items: string[]
    page: number,
    per_page?: number,
    has_more: boolean,
    total: number
}

export interface StudyPreparationRequest {
  subjects: PreparedSubject[]
}