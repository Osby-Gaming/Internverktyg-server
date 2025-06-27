"use client";

import { getLoggedInAccount, loginAccount } from "@/lib/appwrite_client";
import { validateEmailFormat, validatePassword } from "@/lib/util";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter()

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true);

  async function submit() {
    if (!validateEmailFormat(email)[0]) {
      return setError('Ange en giltig e-postadress');
    }

    const [passwordValid, _] = validatePassword(password);

    if (!passwordValid) {
      return setError("Ange ett giltigt lösenord");
    }

    const result = await loginAccount(email, password);

    if (result.status !== 200 && result.message.startsWith('Invalid')) {
      return setError('Fel lösenord eller mejladress');
    }

    if (result.status !== 200) {
      return setError(result.message);
    }

    router.push('/');
  }

  function enterSubmitWrapper() {
    if (!email || !password) {
      return;
    }

    submit();
  }

  useEffect(() => {
    getLoggedInAccount().then(res => {
      if (res.message === 'Account gotten successfully') {
        router.push('/');
      }
    })
  },  []);

  return (
    <form id="loginForm">
      <label htmlFor="email">Email:</label>
      <br />
      <input type="text" id="email" name="email"
        placeholder="Enter your email" required onChange={(e) => {
          setError('');
          setEmail(e.target.value);

          if (e.target.value.length > 0 && password.length > 0) {
            setButtonDisabled(false);
          } else {
            setButtonDisabled(true);
          }
        }} onKeyDown={(e) => {
          setError('');
          if (e.key === "Enter")
            enterSubmitWrapper();
        }} />
      <br />

      <label className="" htmlFor="password">Password:</label>
      <br />
      <input type="password" id="password" name="password"
        placeholder="Enter your Password" required onChange={(e) => {
          setError('');
          setPassword(e.target.value);

          if (email.length > 0 && e.target.value.length > 0) {
            setButtonDisabled(false);
          } else {
            setButtonDisabled(true);
          }
        }} onKeyDown={(e) => {
          if (e.key === "Enter")
            enterSubmitWrapper();
        }} />
      <br />

      <p className="error absolute text-sm">{error}</p>
      <br />

      <div className="flex justify-center">
        <button type="submit" form="form1" value="Submit" onClick={submit} disabled={buttonDisabled}>Submit</button>
      </div>
    </form>
  );
}