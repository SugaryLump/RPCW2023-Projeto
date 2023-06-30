# LearnVault

O LearnVault é uma aplicação web simples de partilha recursos direcionada a comunidades académicas. Permite carregar ficheiros ``.zip`` que podem ser encontrados, descarregados e avaliados por qualquer utilizador.

![](https://hackmd.io/_uploads/ryUrtQhdh.png)


![](https://hackmd.io/_uploads/ryMvKmnd2.png)

- - - 
# Funcionalidades e implementação
### Perfis
Para acedar à maioria das funcionalidades da aplicação, um utilizador terá de se autenticar na plataforma. Para isto, a plataforma dispõe de um sistema de perfis básico com autenticação implementada em ``jwt``/``passport``.

Um utilizador autenticado terá ainda acesso a funcionalidades condicionado de  acordo com o seu nível de acesso (ou `user` ou `admin`). A implementação das restrições de níveis permissão/autenticação é feita feita em grande parte com _middleware_ reutilizável que recolhe e verifica informação relevante.

As condições das funcionalidades principais estão ilustradas na seguinte tabela:

| Funcionalidade              | Não Autenticado | `user` | `admin` |
|:--------------------------- |:---------------:|:------:|:-------:|
| Visualizar publicações      |        X        |   X    |    X    |
| Descarregar recursos        |        X        |   X    |    X    |
| Publicar recursos           |                 |   X    |    X    |
| Avaliar publicações         |                 |   X    |    X    |
| Receber notificações        |                 |   X    |    X    |
| Gerar notificações (manual) |                 |        |    X    |
| Alterar próprio contúdo     |                 |   X    |    X    |
| Alterar qualquer conteúdo   |                 |        |    X    |
| Alterar próprio perfil      |                 |   X    |    X    |
| Alterar qualquer perfil     |                 |        |    X    |
| Gerir tipos de recursos     |                 |        |    X    |

### Armazenamento de dados
Todos os dados que o programa utiliza (perfis, posts, avaliações) com a exceção dos ficheiros dos recursos são armazenados e consultados a partir de uma base de dados de `mongodb`. A base de dados utiliza três coleções, uma para utilizadores, outra para os recursos, e uma suplementar que armazena os tipos de recursos permitidos.

### Armazenamento e partilha de ficheiros de recursos
Quando é criado um novo recurso, o ficheiro *uploaded* deverá ser um *zip* com um formato semelhante ao *BagIt*, contendo um manifesto com todos os ficheiros bem como a sua **MD5 Checksum** e seguindo a estrutura comum de ter os ficheiros dentro de uma pasta *data*.
É feita uma validação da estrutura do ficheiro, durante a qual se verifica se contém os ficheiros necessários e se as *checksums* estão corretas. Caso contrário, o utilizador receberá um '*wrong file type*' na submissão do ficheiro.

### Distribuição de recursos
A partilha de recursos é realizada através de publicações. Um utilizador que partilhe um recurso cria obrigatoriamente uma *post*, público ou privado, que está associado a um conjunto de ficheiros.

Uma publicação é descrita por:
- Título
- Subtítulo (opcional)
- Publicador
- Autores (quem efetivamente desenvolveu o recurso)
- Descrição
- Comentários
- Visibilidade
- Data de publicação
- Tipo (relatório, artigo, teste, etc...)
- Tags/categorias

As publicações podem ser posteriormente editadas ou eliminadas pelos seus publicadores ou por um administrador, mas os ficheiros a si associados nunca podem ser alterados.

### Avaliação de recursos
Qualquer utilizador autenticado pode comentar um recurso/uma publicação uma vez. O comentário é composto apenas por um corpo de texto e, opcionalmente, pode ainda ter a si associado uma cotação de 1 a 5. As cotações dos comentários determinam unicamente a avaliação de um recurso.

Os comentários podem ser posteriormente eliminados pelos seus publicadores ou por um administrador.

### Procura de recursos
A página inicial da aplicação disponibiliza por predefinição a lista dos recursos ordenada cronologicamente. Qualquer utilizador pode filtrar e ordenar esta lista como desejar. As definições implementadas são:

- Filtros
    - Substring do nome do publicador
    - Substring do título do recurso
    - Intervalo de publicação
    - Intervalo de avaliações
    - Presença de tags
- Ordenação
    - Por data
    - Por avaliação
    - Alfabética
    - Por publicador

### Visualização de notificações
Todos os utilizadores podem receber notificações, que dirigem o utilizador para algo na aplicação. Estas notificações podem ser geradas manualmente por administradores ou geradas automaticamente nos seguintes casos:
- Edição de um post (apenas para publicador do mesmo)
- Criação de um post
- Avaliação de um recurso (apenas para publicador do mesmo)


além disso, as notificações podem conter uma ligação, e podem ser dirigidas a um utilizador individual ou a todos os utilizadores do sistema. Estas são armazenadas dentro do _record_ de cada utilizador, de modo a unificar o sistema de notificações.

### Administração
Os utilizadores com nível de acesso de administrador podem gerir certos aspetos da aplicação sem qualquer restrição. Em particular, qualquer administrador pode alterar qualquer recurso, comentário ou utilizador na aplicação. Adicionalmente, administradores podem criar tipos novos de recursos (`dissertação`, `dataset`, ...).

O primeiro administrador da aplicação tem de ser criado manualmente com acesso direto à base de dado, enquanto que próximos administradores podem ser criados/promovidos por outros.

- - -
# Distribuição da aplicação
A aplicação fornece um `Dockerfile` e um ficheiro `docker-compose.yml`. Estes ficheiros podem ser utilizados tanto para desenvolvimento como para _deployment_ final da aplicação.

Para o _deployment_, foi criado um `Dockerfile` que copia o código e instala todas as dependências necessárias. Este `Dockerfile` é depois utilizado pelo `docker-compose` para criar um _container_ com a aplicação, tendo a persistência de dados configurada através de volumes e de um segundo _container_ com MongoDB, e a aplicação exposta na porta 7777.

O mesmo `Dockerfile` é aproveitado para desenvolvimento, alterando apenas os volumes montados, sendo que neste criamos também um volume com o código.

O _deployment_ pode ser feito através do comando `docker-compose up learnvault`. O ambiente de desenvolvimento pode ser iniciado com `docker-compose up learnvault-dev`.