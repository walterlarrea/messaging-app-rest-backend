import{j as s}from"./jsx-runtime.brvLbZ6j.js";import{s as x}from"./auth.Ilt-Bd4Y.js";import{B as h}from"./iconBase.YqCPaJlw.js";import{I as l}from"./Input.Stasp_s2.js";import{Y as w,l as b}from"./index.esm.jz54AZCJ.js";import{r as j}from"./index.9-aKW1zO.js";import{L as E}from"./Loader.5j3Wnp7_.js";import{B as c}from"./react-toastify.esm.4Fmdt3r8.js";import"./index.rS7vpNfE.js";import"./index.aZD16Ifr.js";import"./index.a4cdf180.iEdQifKq.js";import"./axios.yQ12Wcn0.js";const{string:L,object:y}=w,A=y().shape({email:L().matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.([a-zA-Z]){2,3}$/,"E-mail is not valid").email().required("E-mail is required").max(60)}),$=({classes:d})=>{const[p,a]=j.useState(!1),f=async o=>{o.preventDefault();const t=o.target;a(!0);const i=new FormData(t),n={email:i.get("email"),password:i.get("password")},m=await A.validate(n,{abortEarly:!1}).then(e=>e).catch(e=>e);if(!m.email){m.inner.map(e=>c.error(e.message)),a(!1);return}a(!1),b(n).then(e=>{const r=e.accessToken,g=e.userId,u=e.role;x({userId:g,role:u,accessToken:r}),t.reset(),window.location.href="/messages"}).catch(e=>{const r=e?.errors?.[0]?e?.errors?.[0].msg:"An unknown error occur";c.error(r),a(!1)})};return s.jsxs(s.Fragment,{children:[s.jsxs("form",{className:`flex flex-wrap items-end gap-[10px] p-[15px] border-2 border-[--border] rounded-[20px] bg-[--background] ${d}`,onSubmit:f,noValidate:!0,children:[s.jsx(l,{id:"login-email",name:"email",type:"email",children:"E-mail"}),s.jsx(l,{id:"login-password",name:"password",type:"password",children:"Password"}),s.jsx(h,{classes:"ms-auto",type:"submit",children:"Sign in"})]}),p&&s.jsx(E,{})]})};export{$ as default};
