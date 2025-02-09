"use client";

import { getLoggedInAccount, loginAccount } from "@/lib/appwrite.ts";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
  const router = useRouter()
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [buttonClickable, setButtonClickable] = useState(false);

  async function submit() {
    if (!email) {
      return setError('Please enter an email');
    }
    if (!password) {
      return setError('Please enter a password');
    }

    setError('');

    const result = await loginAccount(email, password);

    if (result.status !== 200) {
      if (result.message.startsWith('Invalid')) {
        return setError('Fel lösenord eller mejladress');
      }

      return setError(result.message);
    }

    setEmail('');
    setPassword('');

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
  })

  return (
      <form id="loginForm">
        <label htmlFor="email">Email:</label>
        <br />
        <input type="text" id="email" name="email"
          placeholder="Enter your email" required onChange={(e) => {
            setEmail(e.target.value);

            if (e.target.value.length > 0 && password.length > 0) {
              setButtonClickable(true);
            } else {
              setButtonClickable(false);
            }
          }} onKeyDown={(e) => {
            if (e.key === "Enter")
              enterSubmitWrapper();
          }} />
        <br />

        <label className="" htmlFor="password">Password:</label>
        <br />
        <input type="password" id="password" name="password"
          placeholder="Enter your Password" required onChange={(e) => {
            setPassword(e.target.value);

            if (email.length > 0 && e.target.value.length > 0) {
              setButtonClickable(true);
            } else {
              setButtonClickable(false);
            }
          }} onKeyDown={(e) => {
            if (e.key === "Enter")
              enterSubmitWrapper();
          }} />
        <br />

        <p className="error absolute text-sm">{error}</p>
        <br />

        <div className="flex justify-center">
          <button type="submit" form="form1" value="Submit" onClick={submit} disabled={!buttonClickable}>Submit</button>
        </div>
      </form>
  );
}
