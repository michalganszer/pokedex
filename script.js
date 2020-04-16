//DOM objects
const pokedex = document.querySelector(".pokedex");
const prevButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");
const poisonButton = document.querySelector(".poison-button");
const bugButton = document.querySelector(".bug-button");
const filterButton = document.querySelectorAll(".filter");

//Event Listeners

nextButton.addEventListener('click', NextPage);
prevButton.addEventListener('click', PrevPage);

for(let i = 0; i<filterButton.length; i++ ){
    let buttonName = filterButton[i].textContent;
    filterButton[i].addEventListener('click', function(){   //dodaj event Listener do każdego buttona
        if(!filterButton[i].classList.contains("clicked")){
            doFilter(buttonName);
            for (let j = 0; j<filterButton.length; j++ ){
                filterButton[j].classList.remove("clicked");
            }
            this.classList.add("clicked");
        }
        else{
            this.classList.remove("clicked");
            pokedex.innerHTML = "";
            createPage(1,21);         //wygeneruj listę wszystkich pokemonów (bez filtra) po odkliknięciu buttona
        }
    });
}



let fetchedPokemons = [];   //przechowuje wszystkie pokemony pobrane z api
let filteredPokemons = [];  //przechowuje id pokemonów gdy filtrowanie jest włączone                          
let nextUrl = [0,0];        //id pokemonów jakie zostaną stworzone po kliknięciu przycisku 'wstecz' (początkowo nieaktywmy)
let prevUrl = [1,21];       //id pokemonów jakie zostaną stworzone po kliknięsiu przyciuku 'dalej'
let filter = null;          //obecnie używany filtr


function renderPokemon(id){ //stwórz pokemona, kożystając z listy 'fetchPokemons'
    let types="";
    for(type in fetchedPokemons[id-1].types){
        types += "<li>" + fetchedPokemons[id-1].types[type] + "</li>";
    }
    pokedex.innerHTML += "<div class='pokemon'>"
    + "<img src="+fetchedPokemons[id-1].img+"><br>"
    + "<h2>" + fetchedPokemons[id-1].name + "</h2></div>" +
    "<div class='modal'><div class='modal-wrapper'>" +
    "<div><img src="+fetchedPokemons[id-1].img+"><h2>" + fetchedPokemons[id-1].name + "</h2></div>" +
    "<div><p>Types:</p><ul>"+types+"</ul></div>" +
                "<div class='close'>&times;</div></div>";

}

function NextPage(){        //przejdź do kolejnej strony
    if (filter == null || filteredPokemons.length%20 == 0){ //button nieaktywny na ostatniej stronie, trzeba dopracować
        pokedex.innerHTML = "";
        createPage(nextUrl[0],nextUrl[1], filter); //stwórz kolejną stronę
    }
    
}
function PrevPage(){        //przejdź do poprzedniej strony
    if (filter == null){    //jak filtrowanie jest nieaktywne
        if(prevUrl[1]>=20){ //button nieaktywny na pierwszej stronie
            pokedex.innerHTML = "";
            createPage(prevUrl[0],prevUrl[1], filter);} //stwórz poprzdnią stronę
    }
    else{                   //jak filtrowanie jest aktywne
        if(filteredPokemons.length%20 == 0 && filteredPokemons.length>20){  // dla wszystkich stron na kótrych jest 20 pokemonów
            filteredPokemons.splice(-20);                                   // wyrzuć ostatnie 20 pokemonów z listy
        }
        else if(filteredPokemons.length>20){                                //dla ostatniej strony, kiedy na niej jest mniej niż 20 pokemonów
            filteredPokemons.splice(-(filteredPokemons.length%20));
        }
        let lastFilter = filteredPokemons.slice(filteredPokemons.length - 20, filteredPokemons.length);


        if(filteredPokemons.length>=20){
            pokedex.innerHTML = "";
            nextUrl = [filteredPokemons[filteredPokemons.length-1]+1,filteredPokemons[filteredPokemons.length-1]+21];
            for (pokemon in lastFilter){
                renderPokemon(lastFilter[pokemon]);                         //stwórz poprzednią strtonę kożystając z listy 'lastFilter'
                loadModal(); //stwórz modal box jak już pokemony są wczytane
            }
        }
        
    }
}

function doFilter(x){           //aktywuj filtr
    pokedex.innerHTML = "";
    filter = x;
    createPage(1,21, filter);   //stwórz pierwszą stronę z uwzględnieniem filtra
}

async function createPage(startId, endId, filter){      //stwórz stronę
    let notThisType = 0;                                //przechowuje informacje o liczbie pokemonów niespełniających kryterium filtrowania
    for(let id = startId; id<endId; id++){
        let found = false;                              //przechowuje informacje czy api pokemona już zostało pobrane
        for(let i = 0; i<=fetchedPokemons.length; i++){
            
            if(fetchedPokemons[0]!= null && fetchedPokemons[i]!=null && fetchedPokemons[i].id == id){   //jeśli api pokemona zastało pobrane (jego id znajduje się w liście 'fetchedPokemons')
                found = true;                           //pokemon już istnieje na liście! Nie trzeba go poberać!
                let pokeTypes = [""];
                for (type in fetchedPokemons[i].types){
                    let typeName = fetchedPokemons[i].types[type];
                    pokeTypes[type] = typeName;
                        }
                if(filter==null || fetchedPokemons[i].types.includes(filter)){ //filtrowanie
                    renderPokemon(id);                  //stwórz pokemona
                    if(filter!=null){
                        filteredPokemons.push(id)       //dodaj pokemona do listy z przefiltrowanymi pokemonami, jak filtr jest aktywny
                    }
                }
                else{
                    notThisType++                       //pokemon istnieje w liście 'fetchedPokemons', ale nie spełnia założeń filtra
                }
                
            }
        }
            
        if (!found && id<=807){                 //jesli api nie zostało jeszcze pobrane
            await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
            .then(response => response.json())
            .then (data=>{
                let pokeTypes = [""];
                for (type in data.types){   
                    let typeName = data.types[type].type.name;
                    pokeTypes[type] = typeName;
                        }
                let img = data.sprites.front_default;
                if(img == null){
                    img = "no-photo.png";
                }
                        
                fetchedPokemons.push({id:id, name:data.name, img:img, types:pokeTypes});    //dodaj dane pokemona do listy
                if(filter==null || pokeTypes.includes(filter)){
                    renderPokemon(id);          //stwórz pokemona
                    if(filter!=null){
                        filteredPokemons.push(id)
                    }
                }
                else{
                    notThisType++   //pokemon nie spełnia założeń filtra
                }
                                         
            });
            
        }
        if(id == (endId - 1)){
            loadModal(); //stwórz modal box jak już pokemony są wczytane
        }
        
    }
    
    if(notThisType>0){ //jak w pierwszej 20 nie znalazłeś pokemonów z określonym filtrem, to szukaj dalej, aż uzbierasz 20 na stronie
        createPage(endId, endId+notThisType, filter);
    }
    
    if(filteredPokemons.length>1){  //zapamiętaj id pokemonów do stworzenia kolejnej strony, gdy filtrowanie jest aktywne
        nextUrl = [filteredPokemons[filteredPokemons.length-1]+1,filteredPokemons[filteredPokemons.length-1]+21]
    }
    else{
        nextUrl = [endId,endId+20]; //zapamiętaj id pokemonów do stworzenia kolejnej strony
    }
    prevUrl = [startId-20,startId]; //zapamiętaj id pokemonów do stworzenia poprzedniej strony
    
}


//załaduj stronę po raz pierwszy
createPage(1,21);



/*stwórz modal box jak już pokemony są wczytane*/
let modal;
let modalButton;
let span;

function loadModal(){
modal = document.querySelectorAll(".modal");
modalButton = document.querySelectorAll(".pokemon");
span = document.querySelectorAll(".close");

for(let i = 0; i<modalButton.length; i++){
  modalButton[i].addEventListener('click', function(){  //otwórz modal
    modal[i].style.display = "block";
    document.querySelector("body").style.overflow = "hidden";
  });
}

for(let i = 0; i<span.length; i++){
  span[i].addEventListener('click', function(){         //zamknij modal
  for(let i = 0; i<modal.length; i++){
    modal[i].style.display = "none";
    document.querySelector("body").style.overflow = "auto";
  }
  
});
}
}
