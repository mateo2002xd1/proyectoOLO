import { camposDe } from './src/shared/auditoria-campos';

const body = {
  name: 'Juan',
  apellidos: 'Muñeton',
  email: 'juancholis@sena.edu.co',
  role_id: '44d33d7a-7695-435a-99a6-d200a6fec657',
  expiration_date: '2026-12-30'
};

const estadoAnterior = {
  id: 'c71513ea-833c-4d76-9d2e-78801c85d06e',
  name: 'Mateo',
  apellidos: 'Pelaez',
  email: 'mateo@sena.edu.co',
  role_id: 'some-role',
  expiration_date: '2026-10-10'
};

console.log(camposDe(body, estadoAnterior));
