import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import RegistrationSuccessPage')) {
  content = content.replace(
    /import RegisterPage from "@\/pages\/register";/,
    'import RegisterPage from "@/pages/register";\nimport RegistrationSuccessPage from "@/pages/registration-success";'
  );

  content = content.replace(
    /<Route path="\/register">[\s\S]*?<\/Route>/,
    match => `${match}\n          <Route path="/registration-success">\n            <PrivateRoute>\n              <RegistrationSuccessPage />\n            </PrivateRoute>\n          </Route>`
  );

  fs.writeFileSync('src/App.tsx', content, 'utf8');
  console.log('App.tsx updated');
} else {
  console.log('Already updated');
}
