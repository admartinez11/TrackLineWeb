export async function login(username, password) {
  const response = await fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Usuario o contraseña incorrectos");
  }

  return await response.json(); 
}

//Verificar el estado de autenticación actual
export async function me() {
  const info = await fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/me", {
      credentials: "include"
  });
  return info.ok ? info.json() : { authenticated: false}; // devuelve info del usuario o false
} 

// Cierra la sesión del usuario 
export async function logout() {
  try{
    const r = await fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/logout", {
      method: "POST",
      credentials: "include", // necesario para que el backend identifique la sesión
    });
    return r.ok; //true si el logout fue exitoso
  } catch{
    return false; // false en caso de error de red u otro fallo
  }
}