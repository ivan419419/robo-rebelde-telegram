# Robô Rebelde no Telegram

O jogo continua estático: não precisa de servidor, banco de dados, ranking nem token de bot. A pontuação só existe durante a partida. O arquivo `index.original.html` é o backup intacto do HTML recebido.

## 1. Publicar grátis com GitHub Pages

1. Crie um repositório no GitHub ou use um que já exista. Coloque `index.html` na raiz e envie as alterações para a branch principal (geralmente `main`). O backup é opcional para a publicação.
2. No repositório, abra **Settings → Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**; escolha a branch `main` e a pasta `/(root)`, e salve.
4. Aguarde o deploy. A URL costuma ser `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`. Confirme que ela abre com `https://` e que o jogo aparece antes de configurar o bot.

O GitHub pode levar alguns minutos para publicar. Veja o [guia oficial do GitHub Pages](https://docs.github.com/en/pages/quickstart).

## 2. Criar/configurar o bot e o botão “🎮 Jogar”

1. No Telegram, abra **@BotFather** e envie `/newbot` se ainda não tiver bot. Siga as instruções de nome e usuário. Não coloque o token do bot no HTML, no repositório ou no chat.
2. Para o botão no chat, envie `/setmenubutton`, escolha o bot, informe o texto `🎮 Jogar` e cole a URL HTTPS do GitHub Pages.
3. Se quiser também o botão destacado **Launch app** no perfil do bot, abra `/mybots → seu bot → Bot Settings → Configure Mini App` no BotFather, habilite/configure a Mini App e use a mesma URL HTTPS.

A integração usa o SDK oficial `telegram-web-app.js`, chama `ready()` e `expand()` quando o jogo abre no Telegram e ajusta as cores da barra do app. Consulte a [documentação oficial de Mini Apps](https://core.telegram.org/bots/webapps).

## 3. Testar no Android

1. Abra o bot no aplicativo Telegram e toque em **🎮 Jogar**.
2. Toque em **COMEÇAR A JOGAR**. O campo “Comando em digitação” abre o teclado virtual; digite as letras da palavra mostrada sobre o alvo.
3. Confirme que o obstáculo é desviado, drones são atacados, cristais são coletados, a pontuação atualiza e os botões pausar/continuar/recomeçar respondem.

O jogo também continua abrindo como uma página web normal fora do Telegram. Para a publicação final, falta apenas conhecer o repositório GitHub e ter acesso de escrita a ele; nenhum token do bot é necessário para esta etapa.