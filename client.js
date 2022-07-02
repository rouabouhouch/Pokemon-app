/* ******************************************************************
 * Constantes de configuration
 * ****************************************************************** */
const apiKey = "03c8fd73-7c0e-426a-b20a-bbf830bd715a"; //"69617e9b-19db-4bf7-a33f-18d4e90ccab7";
const serverUrl = "https://lifap5.univ-lyon1.fr";

/* ******************************************************************
 * Gestion de la boîte de dialogue (a.k.a. modal) d'affichage de
 * ****************************************************************** */

/**
 * Fait une requête GET authentifiée sur /whoami avec la clef API fournit
 * @param API clef API
 * @returns une promesse du login utilisateur ou du message d'erreur
 */
function fetchWhoami(API) {
  return fetch(serverUrl + "/whoami", { headers: { "Api-Key": API } })
    .then((response) => {
      if (response.status === 401) {
        return response.json().then((json) => {
          console.log(json);
          return { err: json.message };
        });
      } else {
        return response.json();
      }
    })
    .catch((erreur) => ({ err: erreur }));
}
/**
 * Fait une requête GET authentifiée sur /Pokemon avec la clef API fournit
 * @param None
 * @returns une promesse du login utilisateur ou du message d'erreur
 */
function fetchPokemon() {
  return fetch(serverUrl + "/pokemon", { headers: { "Api-Key": apiKey } })
    .then((response) => {
      if (response.status !== 200) {
        return response.json().then((json) => {
          console.log(json);
          return { err: json.message };
        });
      } else {
        return response.json();
      }
    })
    .catch((erreur) => ({ err: erreur }));
}

/**
 * Fait une requête sur le serveur et insère le login dans la modale d'affichage
 * de l'utilisateur puis cache cette modale.
 * @param {Etat} etatCourant l'état courant
 * @param apikey clef API
 * @returns Une promesse de mise à jour
 */
function lanceWhoamiEtInsereLogin(apikey, etatCourant) {
  return fetchWhoami(apikey).then((data) => {
    majEtatEtPage(etatCourant, {
      login: data.user, // qui vaut undefined en cas d'erreur
      errLogin: data.err, // qui vaut undefined si tout va bien
      loginModal: false, // on cache la modale
    });
  });
}

/**
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML ainsi qu'un objet lançant un fetch
 *  de la clef fournit si l'on click sur le bouton valider
 */
function connectuserapi(etatCourant) {
  return {
    html: `
        <input type="text" id="api" placeholder="insérez votre clé API">
      
    
    `,
    callbacks: {
      "btn-submit": {
        onclick: () =>
          lanceWhoamiEtInsereLogin(
            document.getElementById("api").value,
            etatCourant
          ),
      },
    },
  };
}

/**
 * Fonction qui génére un objet html si l'utilisateur est connecté
 * @param {Etat} etatCourant
 * @returns un objet contenant un objet html et un callbacks
 */
function showLogin(etatCourant) {
  const html = `
  <div class="navbar-end">
    <div class="navbar-item">
      <p >
       user ${etatCourant.login}
      <p>
    </div>
  </div>`;
  return {
    html: html,
    callbacks: {},
  };
}

/**Déclenche une requête sur le serveur et déclenche
 *la MAJ de la page avec la liste des pokemons
 *La fonction initialise aussi les champs d'etatCourant à initialiser
 *@param {Etat} etatCourant
 *@returns une promesse
 */
function pokerecu(etatCourant) {
  return fetchPokemon() //Promesse de fetch
    .then((json) =>
      majEtatEtPage(etatCourant, {
        nbPok: 10,
        type_tri: 0,
        ordre_tri: 1,
        search: "",
        pokemons: json,
        selectedPok: json[1],
      })
    );
}

/**id change selected
 * @param {Etat} etatCourant
 * @param poke
 * @returns un callback pour changer le pokemon selectionné
 */
function callbackOnclickSelectedPok(etatCourant, poke) {
  const callback = {};
  callback[`tabLigne${poke.PokedexNumber}`] = {
    onclick: () => majEtatEtPage(etatCourant, { selectedPok: poke }),
  };
  return callback;
}
/**id change etat de tri
 * @param {Etat} etatCourant
 * @param poke
 * @returns un callback pour changer le pokemon selectionné
 */
function callbackOnclicktriPok1(etatCourant, poke) {
  const callback = {};
  callback[`number`] = {
    onclick: () => majEtatEtPage(etatCourant, { type_tri: 0 }),
  };
  return callback;
}
/**id change etat de tri
 * @param {Etat} etatCourant
 * @param poke
 * @returns un callback pour changer le pokemon selectionné
 */
function callbackOnclicktriPok2(etatCourant, poke) {
  const callback = {};
  callback[`Name`] = {
    onclick: () => majEtatEtPage(etatCourant, { type_tri: 1 }),
  };
  return callback;
}
/**id change etat de tri
 * @param {Etat} etatCourant
 * @param poke
 * @returns un callback pour changer le pokemon selectionné
 */
function callbackOnclicktriPok3(etatCourant, poke) {
  const callback = {};
  callback[`Abilities`] = {
    onclick: () => majEtatEtPage(etatCourant, { type_tri: 3 }),
  };
  return callback;
}

/**************************************************************************************
 * fonctions de trie
 ************************************************************************************/
/**
 *trie de pokemon par numéro
 *modifie la fonction sort selon bool
 *si bool vaut zero alors la fonction sort retourne a-b sinon b-a
 *on untilse parseInt pour convertir en entier les valeurs de a et de b
 */
function triesParNum(pokemons, bool) {
  if (bool == 0) {
    pokemons.sort(function (a, b) {
      return parseInt(a.PokedexNumber) - parseInt(b.PokedexNumber);
    });
  } else {
    pokemons.sort(function (a, b) {
      return parseInt(b.PokedexNumber) - parseInt(a.PokedexNumber);
    });
  }
}
/**
habetique
 modifie la fonction sort selon bool
 si bool vaut zero alors la fonction sort retourne -1 pour a.name <b.name et 1 pour a.name>b.name
 si bool vaut zero alors la fonction sort retourne 1 pour a.name <b.name et -1 pour a.name>b.name
 zero est retourné si aucun des cas
 */
function triesParName(pokemons, bool) {
  if (bool == 0) {
    pokemons.sort(function (a, b) {
      if (a.Name < b.Name) {
        return -1;
      } else if (a.Name > b.Name) {
        return 1;
      } else {
        return 0;
      }
    });
  } else {
    pokemons.sort(function (a, b) {
      if (a.Name < b.Name) {
        return 1;
      } else if (a.Name > b.Name) {
        return -1;
      } else {
        return 0;
      }
    });
  }
}
/**
Trie de pokemon par ability
modie la fonction sort de l'objet pokemons selon la valeur de bool
si bool vaut zero alors retourne -1 si  "Abilities a < abilities b" et 1 si  "Abilities a" > "abilities b "
si bool vaut un alors retourne 1 si  "Abilities a < abilities b" et -1 si  "Abilities a" > "abilities b "
 */
function triesParAbility(pokemons, bool) {
  if (bool == 0) {
    pokemons.sort(function (a, b) {
      if (a.Abilities[0] < b.Abilities[0]) {
        //on compare les premiers elements de 2 pokemons
        return -1;
      } else if (a.Abilities[0] > b.Abilities[0]) {
        return 1;
      } else {
        return 0;
      }
    });
  } else {
    pokemons.sort(function (a, b) {
      if (a.Abilities[0] < b.Abilities[0]) {
        return 1;
      } else if (a.Abilities[0] > b.Abilities[0]) {
        return -1;
      } else {
        return 0;
      }
    });
  }
}

function triesParType(pokemons, bool) {
  if (bool == 0) {
    pokemons.sort(function (a, b) {
      if (a.Types[0] < b.Types[0]) {
        //on compare les premiers elements de 2 pokemons
        return -1;
      } else if (a.Types[0] > b.Types[0]) {
        return 1;
      } else {
        return 0;
      }
    });
  } else {
    pokemons.sort(function (a, b) {
      if (a.Types[0] < b.Types[0]) {
        return 1;
      } else if (a.Types[0] > b.Types[0]) {
        return -1;
      } else {
        return 0;
      }
    });
  }
}

/**Fonction qui créer les 4 callbacks onclick pour changer l'ordre de tri du tableau
 * @param {Etat} etatCourant
 * @returns un tableau de callback pour changer le type de tri
 */
function callbacksOnclickTri(etatCourant) {
  return {
    html: "",
    callbacks: {
      id: {
        onclick: () =>
          majEtatEtPage(etatCourant, {
            type_tri: 0,
            ordre_tri: !ordre_tri,
          }),
      },
      Name: {
        onclick: () =>
          majEtatEtPage(etatCourant, {
            type_tri: 1,
            ordre_tri: !ordre_tri,
          }),
      },
      Abilities: {
        onclick: () =>
          majEtatEtPage(etatCourant, {
            type_tri: 2,
            ordre_tri: !ordre_tri,
          }),
      },
      Types: {
        onclick: () =>
          majEtatEtPage(etatCourant, {
            type_tri: 3,
            ordre_tri: !ordre_tri,
          }),
      },
    },
  };
}


/* ************************************************************************
 * Combat et Connexion.
 * ****************************************************************** */

/**
 * MAJ de page
 * affiche login
 * @param {Etat} etatCourant
 */
function showconnexion(etatCourant) {
  majEtatEtPage(etatCourant, { loginModal: true });
}

/**
 * Génère le code HTML
 * navigation qui contient le bouton de login.
 * @param {Etat} etatCourant
 * @returns un objet 
 */
function genereBoutonConnexion(etatCourant) {
  const text = etatCourant.login ? "déconnexion" : "connexion";
  const html = `
  <div class="navbar-end">
    <div class="navbar-item">
      <div class="buttons">
        <a id="btn-open-login-modal" class="button is-dark"> ${text} </a>
      </div>
    </div>
  </div>`;
  return {
    html: html,
    callbacks: {
      "btn-open-login-modal": {
        onclick:
          etatCourant.login !== undefined
            ? () => majEtatEtPage(etatCourant, { login: undefined })
            : () => showconnexion(etatCourant),
      },
    },
  };
}
/** Fonction qui change la classe de la ligne sélectionnée pour qu'elle soit selec
 * @param ligneTab une ligne du tableau
 * @param {Etat} etatCourant
 * @returns "is-selected" si la ligne est sélectionnée, rien sinon
 */
function genereClassSelected(pokemon, etatCourant) {
  return pokemon === etatCourant.selectedPok ? "is-selected" : "";
}

/**Fonction qui génère l'html d'une ligne du tableau de pokemon
 * @param n pokemon
 * @param {Etat} etatCourant
 * @returns du code html
 */
function genereTabLignePokemon(m, etatCourant) {
  return ` 
  
  <tr id="tabLigne${m.PokedexNumber}"
    class="${genereClassSelected(m, etatCourant)}"> 
    <td>
    <img
    alt="${m.Name}"
    src="${m.Images.Detail}"
    width="60"
    />
    </td>
    <td><div class="content">${m.PokedexNumber}</div></td>
    <td><div class="content">${m.Name}</div></td>
    <td>
    <ul>
    ${m.Abilities.map((a) => `<li> ${a} </li>`).join("\n")}
    </ul>
    </td>
    <td>
    <ul>
    ${m.Types.map((a) => `<li> ${a} </li>`).join("\n")}
    </ul>
    </td> 
    </tr>`;
}

/** Fonction qui génère le header du tableau de pokemons
 * @returns du code html
 */
function genenreHeaderTabPokemon() {
  return `   <thead >
  <tr>
     <th><a>Image<a></th>
      <th id="number">#<i class="fas fa-angle-up"></i></th>
      <th id="Name"> <a>Name</a></th>
      <th id="Abilities"> <a>Abilities</a></th>
      <th id="Types"><a>Types</a></th>
  </tr>`;
}

/** Fonction div tab
 * @param tab tableau de pokemon
 * @returns du code html
 */
function divmodale(tab) {
  return (
    `
    <div class="column">
    <div id="tbl-pokemons">
    <table class="table is-fullwidth">
    ${genenreHeaderTabPokemon()}
    <tbody>` +
    tab +
    `</tbody>
    </table>
    </div>
    </div>`
  );
}

/**Fonction qui génère l'html de la liste des pokemon avec l'état courant de la page
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html
 */
function genereTabPokemon(etatCourant) {
  if (etatCourant.pokemons !== undefined) {
    const filterTabPokemon = filterPokemon(etatCourant);
    const html = triPokemon(
      etatCourant.type_tri,
      etatCourant.ordre_tri,
      etatCourant.search === "" ? etatCourant.pokemons : filterTabPokemon
    )
      .slice(0, etatCourant.nbPok)
      .map((n) => genereTabLignePokemon(n, etatCourant))
      .join("");
    const ligneGenerees =
      etatCourant.search === ""
        ? etatCourant.pokemons
            .slice(0, etatCourant.nbPok)
            .map((n) => callbackOnclickSelectedPok(etatCourant, n))
        : filterTabPokemon
            .slice(0, etatCourant.nbPok)
            .map((n) => callbackOnclickSelectedPok(etatCourant, n));
    return {
      html: divmodale(html),
      callbacks: ligneGenerees.reduce((acc, l) => ({ ...acc, ...l }), {}),
    };
  }
}

/** html carte
 * @param pokemon
 * @returns du code html
 */
function generecarte(pokemon) {
  return `
  <div class="card-header">
    <div class="card-header-title">${pokemon.JapaneseName} 
    (#${pokemon.PokedexNumber})</div>
  </div>
  <div class="card-content">
    <article class="media">
      <div class="media-content">
        <h1 class="title">${pokemon.Name}</h1>
      </div>
    </article>
  </div>`;
}
/**html image
 * @param pokemon
 * @returns du code html
 */
function picture(pokemon) {
  return `
    <figure class="media-right">
      <figure class="image is-475x475">
        <img
          class=""
          src="${pokemon.Images.Detail}"
          alt="${pokemon.Name}"
        />
      </figure>
    </figure>`;
}


/**Fonction qui génère le code html du contenu de la case du pokemon choisi
 * @param pokemon
 * @param tab_res des types auxquels le pokemon résiste
 * @param tab_str des types auxquels le pokemon inflige plus de dégats
 * @returns du code html
 */
function generecartecontent(pokemon, tab_res, tab_str) {
  return `
   <div class="media-content">
      <div class="content has-text-left">
        <p>Hit points: ${pokemon.Hp}</p>
        <h1>Abilities</h1>
          <ol>
            ${pokemon.Abilities.map((a) => `<li> ${a} </li>`).join("\n")}
          </ol>
          <h1>Resistance</h1>
          <ul>
            ${tab_res.map((r) => `<li> ${r} </li>`).join("")}
          </ul>
          <h1>Weakness</h1>
          <ul>
            ${tab_str.map((r) => `<li> ${r} </li>`).join("")}
          </ul>
      </div>
    </div>`;
}




/**Fonction qui génère l'html du pokemon courant si selectedPok est défini
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html
 */
function generatemyselectedp(etatCourant) {
  if (etatCourant.selectedPok !== undefined) {
    return {
      html: genereselectedpok(etatCourant.selectedPok),
      callbacks: {},
    };
  }
}

/**Fonction qui génère le code html pour afficher le pokemon sélectionné
 * @param pokemon
 * @returns du code html
 */
function genereselectedpok(pokemon) {
  return `
    <div class="column">
      <div class="card is-dark ">
        ${generecarte(pokemon)}
        <div class="card-content">
          <article class="media">
            ${generecartecontent(
              pokemon,
              Object.keys(pokemon.Against).filter(
                (n) => pokemon.Against[n] < 1
              ),
              Object.keys(pokemon.Against).filter((n) => pokemon.Against[n] > 1)
            )}
            ${picture(pokemon)}
          </article>
        </div>
      </div>
    </div>`;
}

/**Fonction qui génère le formulaire pour afficher plus ou moins de pokemons
 * @returns un formulaire html
 */
function buttonsmore() {
  return `<form>
  <nav class="navbar is-dark " >
            <button class="button is-dark " id="morePok" > Plus </button>
            <button class="button is-dark" id="lessPok"> Moins </button>
            </nav>
          </form>`;
}

/**
 * Génère le code HTML du bouton permettant de changer le nombre de pokemon afficher
 * @param {*} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function limitpoke(etatCourant) {
  const callbacks = {
    morePok: {
      onclick: () => {
        majEtatEtPage(etatCourant, { nbPok: etatCourant.nbPok + 10 });
      },
    },
    lessPok: {
      onclick: () => {
        if (etatCourant.nbPok > 10) {
          majEtatEtPage(etatCourant, { nbPok: etatCourant.nbPok - 10 });
        }
      },
    },
  };
  return { html: buttonsmore(), callbacks: callbacks };
}

/**
 * Génère le code HTML de la barre de navigation 
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereBarreNavigation(etatCourant) {
  const connexion = genereBoutonConnexion(etatCourant);
  const login =
    etatCourant.login !== undefined ? showLogin(etatCourant).html : "";
  const search = genereSearchPokemon(etatCourant);
  return {
    html: `
      <nav class="navbar is-dark " role="navigation" aria-label="main navigation">
      <div class="navbar is-dark      ">
      <div class="navbar-item"><div class="buttons">
      <a id="btn-pokedex" class="button is-light"> Pokedex </a>
      <a id="btn-combat" class="button is-light"> Combat </a>
      </div></div>
      ${connexion.html} ${login} ${search.html} 
      </div>
      </nav>`,
    callbacks: {
      ...connexion.callbacks,
      ...search.callbacks,
      "btn-pokedex": { onclick: () => console.log("click bouton pokedex") },
    },
  };
}

/**
 * Génére le code HTML de la page 
 * enregistrer sur les éléments de cette page.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function generePage(etatCourant) {
  const barredeNavigation = genereBarreNavigation(etatCourant);
  const modaleLogin = generatelogin(etatCourant);
  const ListePokemon = genereTabPokemon(etatCourant);
  const SelectedPokemon = generatemyselectedp(etatCourant);
  const LimitePokemon = limitpoke(etatCourant);
  const tri = callbacksOnclickTri(etatCourant);
  // remarquer l'usage de la notation ... ci-dessous qui permet de "fusionner"
  // les dictionnaires de callbacks qui viennent de la barre et de la modale.
  // Attention, les callbacks définis dans modaleLogin.callbacks vont écraser
  // ceux définis sur les mêmes éléments dans barredeNavigation.callbacks. En
  // pratique ce cas ne doit pas se produire car barreDeNavigation et
  // modaleLogin portent sur des zone différentes de la page et n'ont pas
  // d'éléments en commun.
  return {
    html:
      barredeNavigation.html +
      modaleLogin.html +
      SelectedPokemon.html +
      ListePokemon.html +
      LimitePokemon.html,
    callbacks: {
      ...barredeNavigation.callbacks,
      ...modaleLogin.callbacks,
      ...ListePokemon.callbacks,
      ...LimitePokemon.callbacks,
      ...tri.callbacks,
    },
  };
}
/**
 * Génère le code HTML du titre de la modale de login et les callbacks associés.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function modalloginhead(etatCourant) {
  return {
    html: `
    <header class="modal-card-head">
  <h1 class="modal-card-title">Users</h1>
  </header  >
  <button
    id="btn-close-login-modal1"
    class="delete"
    ></button>
`,
    callbacks: {
      "btn-close-login-modal1": {
        onclick: () => majEtatEtPage(etatCourant, { loginModal: false }),
      },
    },
  };
}

/**
 * Génère le code HTML du base de page de la modale de login et les callbacks associés.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function loginfooter(etatCourant) {
  return {
    html: `
  <footer class="modal-card-foot" style="justify-content: flex-end">
    <button id="btn-close" class="button">close</button>
    <button id="btn-submit" 
    class=" button">submit</button>
  </footer>
  `,
    callbacks: {
      "btn-submit": {
        onclick: () => majEtatEtPage(etatCourant, { loginModal: false }),
      },
      "btn-close": {
        onclick: () => majEtatEtPage(etatCourant, { loginModal: false }),
      },
    },
  };
}

/**
 * Génère le code HTML de la modale de login et les callbacks associés.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function generatelogin(etatCourant) {
  const header = modalloginhead(etatCourant);
  const footer = loginfooter(etatCourant);
  const body = connectuserapi(etatCourant);
  const classe = etatCourant.loginModal ? "is-active" : "is-inactive";
  return {
    html: `
      <div id="mdl-login" class="modal ${classe}">
        <div class="modal-background"></div>
        <div class="modal-content">
          ${header.html}
          ${body.html}
          ${footer.html}
        </div>
      </div>`,
    callbacks: { ...header.callbacks, ...footer.callbacks, ...body.callbacks },
  };
}
/* ******************************************************************
 * Initialisation de la page et fonction de mise à jour
 * globale de la page.
 * ****************************************************************** */

/**
 * Créée un nouvel état basé sur les champs de l'ancien état, mais en prenant en
 * compte les nouvelles valeurs indiquées dans champsMisAJour, puis déclenche la
 * mise à jour de la page et des événements avec le nouvel état.
 *
 * @param {Etat} etatCourant etat avant la mise à jour
 * @param {*} champsMisAJour objet contenant les champs à mettre à jour, ainsi
 * que leur (nouvelle) valeur.
 */
function majEtatEtPage(etatCourant, champsMisAJour) {
  const nouvelEtat = { ...etatCourant, ...champsMisAJour };
  majPage(nouvelEtat);
}

/**
 * Prend une structure décrivant les callbacks à enregistrer et effectue les
 * affectation sur les bon champs "on...". Par exemple si callbacks contient la
 * structure suivante où f1, f2 et f3 sont des callbacks:
 *
 * { "btn-pokedex": { "onclick": f1 },
 *   "input-search": { "onchange": f2,
 *                     "oninput": f3 }
 * }
 *
 * alors cette fonction rangera f1 dans le champ "onclick" de l'élément dont
 * l'id est "btn-pokedex", rangera f2 dans le champ "onchange" de l'élément dont
 * l'id est "input-search" et rangera f3 dans le champ "oninput" de ce même
 * élément. Cela aura, entre autres, pour effet de délclencher un appel à f1
 * lorsque l'on cliquera sur le bouton "btn-pokedex".
 *
 * @param {Object} callbacks dictionnaire associant les id d'éléments à un
 * dictionnaire qui associe des champs "on..." aux callbacks désirés.
 */
function enregistreCallbacks(callbacks) {
  Object.keys(callbacks).forEach((id) => {
    const elt = document.getElementById(id);
    if (elt === undefined || elt === null) {
      console.log(
        `Élément inconnu: ${id}, 
        impossible d'enregistrer de callback sur cet id`
      );
    } else {
      Object.keys(callbacks[id]).forEach((onAction) => {
        elt[onAction] = callbacks[id][onAction];
      });
    }
  });
}

/**
 * Mets à jour la page (contenu et événements) en fonction d'un nouvel état.
 *
 * @param {Etat} etatCourant l'état courant
 */
function majPage(etatCourant) {
  console.log("CALL majPage", etatCourant);
  const page = generePage(etatCourant);
  document.getElementById("root").innerHTML = page.html;
  enregistreCallbacks(page.callbacks);
}

/**
 * Appelé après le chargement de la page.
 * Met en place la mécanique de gestion des événements
 * en lançant la mise à jour de la page à partir d'un état initial.
 */
function initClientPokemons() {
  console.log("CALL initClientPokemons");
  const etatInitial = {
    loginModal: false,
    login: undefined,
    errLogin: undefined,
  };
  pokerecu(etatInitial);
}

/**
 * Génère l'html de notre bouton rechercher
 * @param {Etat} etatCourant
 * @returns html
 */
function genereSearchButton() {
  return `
    <div class="navbar-item">
      <div class="buttons">
        
          <input class=" input is-rounded" type="search " id="pokemon-name" 
          placeholder="find pokemon" value=''> 
        
      </div>
    </div>`;
}

/**
 * Génère un bouton rechercher en HTML qui lorsqu'on clique déclanche les pokemon associés
 * à la chaine de carctère inscrite
 * @param {Etat} etatCourant
 * @return un champ html qui fait le bouton recherche
 */
function genereSearchPokemon(etatCourant) {
  const html = genereSearchButton();
  return {
    html: html,
    callbacks: {
      "pokemon-name": {
        onchange: () => {
          document.getElementById("pokemon-name").value !== ""
            ? searchPokemon(
                etatCourant,
                document.getElementById("pokemon-name").value
              )
            : searchPokemon(etatCourant, "");
        },
      },
    },
  };
}

/**
 *  les pokemons rechercher
 * @param {Etat} etatCourant
 * @returns une promesse
 */
function searchPokemon(etatCourant, pokemonName = "") {
  majEtatEtPage(etatCourant, { search: pokemonName });
}

/**
recherche pokem
 * @param {Etat} etatCourant
 * @returns Une promesse
 */
function filterPokemon(etatCourant) {
  return etatCourant.pokemons.filter(
    (pokemon) =>
      pokemon.Name.toLowerCase().search(etatCourant.search.toLowerCase()) >= 0
  );
}

/** Fonction qui trie le tableau par ID (numéro du pokedex)
 * @param sens_tri ascendant si impair, descendant sinon
 * @param tabPokemon
 * @returns un tableau de pokemons triés en fonction de l'ID
 */
function triPokemonNum(trivar, tabPokemon) {
  return trivar === 1
    ? tabPokemon.sort((a, b) => a.PokedexNumber - b.PokedexNumber)
    : tabPokemon.sort((a, b) => b.PokedexNumber - a.PokedexNumber);
}

/** Fonction qui trie le tableau de pokemon en fonction de tri voulu
 *
 * @param type_tri
 * @param sens_tri ascendant si pair, descendant sinon
 * @param tabPokemon
 * @returns un tableau de pokemons triés
 */
function triPokemon(type_tri, trivar, tabPokemon) {
  if (type_tri === 0) {
    return triPokemonNum(trivar, tabPokemon);
  }
  //ajouter reste des tries
}
