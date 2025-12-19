
// connection with web
const form = document.getElementById("myForm");
const msg = document.getElementById("msg");

//  //user DETAILS VALIDATION 
const isAlnumMax20 = s => /^[a-z0-9]+$/i.test(s) && s.length <= 20;
const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isPhone10 = s => /^\d{10}$/.test(s);
const isEircode6 = s => /^[0-9][a-z0-9]{5}$/i.test(s);

//listen to the form submittion
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

   //collect the user input to convert it to a js ob

  const data = Object.fromEntries(new FormData(form).entries());


  //collects data and /trim to clean it

  data.first_name = (data.first_name || "").trim();
  data.second_name = (data.second_name || "").trim();
  data.email = (data.email || "").trim();
  data.phone_number = (data.phone_number || "").trim();
  data.eircode = (data.eircode || "").trim();

  const errors = [];   //validation of requirements fot input
  if (!isAlnumMax20(data.first_name)) errors.push("First name invalid");
  if (!isAlnumMax20(data.second_name)) errors.push("Second name invalid");
  if (!isEmail(data.email)) errors.push("Email invalid");
  if (!isPhone10(data.phone_number)) errors.push("Phone must be 10 digits");
  if (!isEircode6(data.eircode)) errors.push("Eircode invalid");

  if (errors.length) {
    msg.textContent = errors.join(" ");     // will show the error to the user
    return;
  }
// submit the data to the api/backend
  const res = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  // responds from the server
  const out = await res.json().catch(() => ({}));
  msg.textContent = res.ok ? "Saved" : (out.error || "Error");
  if (res.ok) form.reset();
});
