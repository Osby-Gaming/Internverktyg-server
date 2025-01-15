"use client";

import { loginAccount } from "@/lib/appwrite.ts";
import { useState } from "react";

export default function LoginTest() {
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
      return setError(result.message);
    }

    setEmail('');
    setPassword('');

    
  }

  function enterSubmitWrapper() {
    if (!email || !password) {
      return;
    }

    submit();
  }

  return (
    <form id="loginForm">
      <label htmlFor="email">Username:</label>
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

      <label htmlFor="password">Password:</label>
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

      <p className="text-red-800">{error}</p>
      <br />

      <button type="submit" form="form1" value="Submit" onClick={submit} disabled={!buttonClickable}>Submit</button>
    </form>
  );
}
