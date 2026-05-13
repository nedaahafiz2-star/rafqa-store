const games = [
  {name:"لعبة العيد", price:10, img:"img1.jpg"},
  {name:"لعبة ذكاء", price:15, img:"img2.jpg"}
];

const container = document.getElementById("games");

games.forEach(g => {
  container.innerHTML += `
    <div class="card">
      <img src="${g.img}" width="100%">
      <h3>${g.name}</h3>
      <p>${g.price} ريال</p>
      <button onclick="addToCart('${g.name}')">أضف للسلة</button>
    </div>
  `;
});

function addToCart(name){
  alert("تمت إضافة " + name);
}