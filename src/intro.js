import React from 'react';
import EpicComponent from 'epic-component';
import url from 'url';

const Task1 = EpicComponent(self => {

  self.render = function () {
    const hintCost = 20; // XXX get from task
    function asset (path) {
      return url.resolve(self.props.baseUrl, path);
    }
    return (
      <div className="taskInstructions">
        <h1>Substitution polyalphabétique 1</h1>

        <h2>Méthode de chiffrement</h2>

        <p>On a vu qu’un message assez long chiffré par substitution peut être décrypté à l’aide d’une analyse de fréquence.</p>
        <p>Pour faire échouer cette approche, on peut utiliser une substitution qui à chaque lettre, associe plusieurs symboles différents. Pour chaque occurrence de la lettre dans le texte clair, on choisit alors aléatoirement un symbole parmi ceux qui correspondent à cette lettre.</p>
        <p>Prenons par exemple la substitution suivante :</p>

        <table className="pre">
          <tbody>
            <tr>
              <td>A</td>
              <td>B</td>
              <td>C</td>
              <td>D</td>
              <td>E</td>
              <td>F</td>
              <td>G</td>
              <td>H</td>
              <td>I</td>
              <td>J</td>
              <td>K</td>
              <td>L</td>
              <td>M</td>
              <td>N</td>
            </tr>
            <tr>
              <td>05</td>
              <td>02</td>
              <td>08</td>
              <td>03</td>
              <td>06</td>
              <td>13</td>
              <td>09</td>
              <td>10</td>
              <td>01</td>
              <td>12</td>
              <td>04</td>
              <td>14</td>
              <td>07</td>
              <td>15</td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>11</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <p>Chaque lettre de ‘A’ à ‘N’ est chiffrée par un nombre, sauf le ‘E’ qui peut être chiffré soit par un 06, soit par un 11.</p>
        <p>Une manière de chiffrer le texte "CHEMINEE" est ainsi :</p>
        <table className="pre">
          <tbody>
            <tr>
              <td>C</td>
              <td>H</td>
              <td>E</td>
              <td>M</td>
              <td>I</td>
              <td>N</td>
              <td>E</td>
              <td>E</td>
            </tr>
            <tr>
              <td>08</td>
              <td>10</td>
              <td>11</td>
              <td>07</td>
              <td>01</td>
              <td>15</td>
              <td>11</td>
              <td>06</td>
            </tr>
          </tbody>
        </table>
        <p>Dans un texte chiffré ainsi, une analyse de fréquence n'aidera pas à trouver quels nombres représentent un ‘E’, car chacun des deux nombres 11 et 06 est deux fois moins fréquent que dans le message d'origine.</p>
        <p>Selon ce principe, on peut affecter autant de nombres différents qu'on le souhaite à chaque lettre. On affecte plus de nombres différents aux lettres les plus fréquentes en français (E, A, S, I, ...) qu'aux lettres les moins fréquentes. C'est ce qui est fait dans ce sujet.</p>

        <h2>Substitution utilisée</h2>

        <p>Dans cette version du sujet, on utilise les nombres de 00 à 29 dans la substitution. À chaque lettre se substitue donc un nombre, et les 4 nombres restants sont attribués aux lettres les plus fréquentes.</p>
        <p>Il est toujours possible de décrypter ces messages, à vous de trouver comment, en vous aidant des outils que nous vous proposons.</p>

        <h2>Substitution et indices</h2>

        <p>Le premier outil joue deux rôles :</p>

        <h3>1) Éditer la substitution :</h3>
        <p>Sous chaque nombre, vous pouvez cliquer et taper au clavier la lettre qui à votre avis est représentée par ce nombre.</p>

        <img src={asset("images/substitutionTool.png")} alt="substitutions" />

        <p>Elle sera alors représentée sous toutes les occurrences de ce nombre dans le reste de la page.</p>

        <img src={asset("images/textTool.png")} alt="texte chiffré et déchiffré" />

        <p>Lorsque vous êtes convaincu qu'il s'agit de la bonne lettre, vous pouvez cliquer sur le cadenas pour la bloquer et éviter de la modifier par erreur. Ceci a pour effet d’assombrir toutes les occurrences du nombre et de la lettre.</p>

        <h3>2) Obtenir des indices :</h3>
        <p>Si vous cliquez simplement sur un nombre, vous pouvez demander en indice, la lettre correspondant à ce nombre, pour un coût de {hintCost} points.</p>

        <img src={asset("images/hints.png")} alt="substitution : obtenir des indices" />

        <p>Une fois l'indice obtenu, la lettre est représentée sous toutes les occurrences de ce nombre, et la case est mise sur fond plus foncé pour bien les distinguer.</p>

        <h2>Recherche et filtrage</h2>

        <p>Cet outil vous permet de chercher des nombres, lettres, paires de nombres et paires de lettres dans le texte chiffré ou déchiffré.</p>
        <p>Dans la zone du haut, une liste de tous les nombres du texte chiffré est fournie, et les lettres déchiffrées lorsqu'elles sont disponibles.</p>

        <img src={asset("images/searchToolSymbols.png")} alt="recherche : couleurs et symboles" />

        <p>On peut colorer certains de ces nombres en cliquant sur la palette pour choisir une couleur, puis sur le nombre que l'on veut colorer. Toutes les occurrences de ce nombre sur la page seront ainsi colorées. On peut colorer simultanément plusieurs nombres, de la même couleur ou de couleurs différentes. Cliquer sur un nombre coloré de l'outil permet de désactiver sa couleur.</p>
        <p>Les cases correspondant à des indices et celles correspondant à des valeurs bloquées sont représentées avec une version plus foncée de la couleur choisie, pour pouvoir les distinguer.</p>
        <p>Lorsqu'un ou plusieurs nombres ont ainsi été colorés, on peut, sur le côté droit, énumérer les occurrences de ces nombres dans le texte chiffré, les boutons permettant de passer à l'occurrence précédente ou suivante.</p>
        <p>La case "Filtrer dans l'analyse" affecte l'affichage de l'outil d'analyse, comme décrit plus bas.</p>
        <p>Dans la zone du bas, on s'intéresse aux paires consécutives de nombres ou lettres. On peut ainsi saisir jusqu'à 6 paires de nombres, ou "bigrammes", pour faire apparaître ou rechercher dans le texte chiffré toutes les positions où ces deux nombres apparaissent successivement dans le texte. De même, on peut saisir jusqu'à 6 paires de lettres à faire apparaître ou rechercher.</p>

        <img src={asset("images/searchToolPairs.png")} alt="recherche : paires de symboles et paires de lettres" />

        <h2>Analyse</h2>

        <p>Deux modes sont disponibles via la liste déroulante : simple et double.</p>
        <p>Dans le mode simple, l'outil représente au milieu tous les nombres du texte, du plus fréquent au moins fréquent, avec le nombre d'occurrences indiqué en dessous.</p>

        <img src={asset("images/analysisToolSymbols.png")} alt="analyse : symboles" />

        <p>À la gauche de chaque nombre, on indique quels nombres apparaissent le plus fréquemment juste avant lui. À sa droite, ceux qui apparaissent le plus fréquemment juste après.</p>
        <p>Ainsi dans l’exemple ci-dessous, le nombre 29 est le plus fréquent dans le texte, où il apparaît 522 fois. Le nombre le plus fréquent à sa gauche est 15, la paire 1529 apparaissant 55 fois dans le texte. De même, le nombre le plus fréquemment à sa droite est 16, et la paire 2916 apparaît 65 fois dans le texte.</p>
        <p>Si la case d’activation du filtrage a été activée dans la partie du haut de l’outil de recherche, seuls les nombres sélectionnés dans cet outil sont considérés. Le filtrage ne s’applique qu’au nombre principal au milieu, les tableaux des deux côtés restent affichés entièrement.</p>
        <p>Dans le mode double, l’outil sélectionne toutes les paires de nombres (bigrammes) du texte, par ordre décroissant de cette fréquence. Là aussi on représente les symboles qui apparaissent le plus fréquemment juste avant et juste après chaque paire.</p>

        <img src={asset("images/analysisToolSymbolsPairs.png")} alt="analyse : paires de symboles" />

        <p>Dans cet exemple, la paire de nombres la plus fréquente est 0702, et le nombre qui la précède le plus souvent est 21, tandis que celui qui la suit le plus souvent est 15.</p>
        <p>Si le filtrage a été activé dans la partie du bas de l’outil de recherche, seuls les bigrammes indiqués dans cet outils sont représentés.</p>
        <p>Enfin, si l’on coche la case à cocher “afficher uniquement les bigrammes répétés”, seules les paires dont les 2 nombres sont identiques sont affichées.</p>

        <h2>Ce que l’on vous demande</h2>

        <p>Comme pour le sujet précédent, votre objectif est de déchiffrer le texte, sachant que le texte d’origine est constitué d’une succession de phrases sans lien entre elles. Du fait de la longueur du texte, il est possible mais très improbable d’obtenir un texte qui semble correct mais ne soit pas exactement identique à la solution attendue.</p>
        <p>N’oubliez pas que vous pouvez faire autant de tentatives que vous le souhaitez, donc n’hésitez pas à demander de nombreux indices lors de vos premières tentatives.</p>
      </div>
    );
  };
});

const Task2 = EpicComponent(self => {
  self.render = function () {
    return (
      <div className="taskInstructions">
        <h1>Substitution polyalphabétique 2</h1>

        <p>Ce sujet est identique au précédent, sauf pour le choix de la substitution : ce sont cette fois ci 45 nombres différents qui sont utilisés, et répartis entre les lettres de l’alphabet pour équilibrer autant que possible les fréquences des nombres.</p>

      </div>
    );
  }
});

export default EpicComponent(self => {
  self.render = function () {
    const {version, baseUrl} = self.props;
    switch (version) {
      case 1: return <Task1 baseUrl={baseUrl}/>;
      case 2: return <Task2 baseUrl={baseUrl}/>;
      default: return false;
    }
  };
});
