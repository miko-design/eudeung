# 유등 정산타임 (Swim Team Bill Splitter)

수영팀 회식비 정산을 위한 React 기반의 쉽고 빠른 계산기입니다. Vite, React, Tailwind CSS로 제작되었습니다.

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the development server:
    ```bash
    npm run dev
    ```

3.  Build for production:
    ```bash
    npm run build
    ```

## 🚀 Deployment (Netlify)

You can deploy this application securely and for free using Netlify.

### Option 1: Manual Upload (Easiest)
1. Run the build command in your terminal:
   ```bash
   npm run build
   ```
2. This creates a `dist` folder in your project directory.
3. Go to [Netlify Drop](https://app.netlify.com/drop).
4. Drag and drop the `dist` folder into the upload area.
5. Your site will be live immediately!

### Option 2: Connect to GitHub
1. Push your code to a GitHub repository.
2. Log in to Netlify and click "Add new site".
3. Choose "Import an existing project".
4. Select GitHub and authorize.
5. Choose your repository (`dinner_split`).
6. Netlify will detect the settings automatically:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
7. Click "Deploy Site".

### ⚠️ "Page Not Found" Error?
If you see a "Page Not Found" error properly after uploading:
1. Ensure you are dragging the **`dist`** folder, not the entire project folder.
2. We have added a `_redirects` file to fix routing issues. Please run `npm run build` again before re-uploading.


## Features

-   **Total Bill Management**: easily input the total bill amount.
-   **Member Management**: Add swim team members dynamically.
-   **Smart Splits**: Evenly splits the bill, with support for individual adjustments (who paid extra/less).
-   **Live Calculation**: Real-time updates of costs per person.
-   **Responsive Design**: Works on mobile and desktop.

## 배포 방법 (Deployment)

이 프로젝트는 정적 웹사이트(Static Website)로 간단하게 배포할 수 있습니다.

### 1. 빌드하기 (Build)
먼저 프로젝트를 배포용 파일로 변환해야 합니다. 터미널에서 아래 명령어를 실행하세요.
```bash
npm run build
```
이 명령어가 완료되면 `dist` 폴더가 생성됩니다. 이 폴더 안에 있는 파일들이 실제 배포될 완성본입니다.

### 2. 배포하기 (다양한 방법)

#### 옵션 A: Vercel / Netlify (추천)
가장 쉽고 무료로 사용할 수 있는 방법입니다.
1. [Vercel](https://vercel.com) 또는 [Netlify](https://netlify.com)에 가입합니다.
2. GitHub에 이 코드를 올렸다면, 해당 서비스를 GitHub 계정과 연동하여 저장소를 선택하기만 하면 자동으로 배포됩니다.
3. 또는 `dist` 폴더를 드래그 앤 드롭하여 수동으로 배포할 수도 있습니다.

#### 옵션 B: GitHub Pages
GitHub 저장소를 사용 중이라면 `gh-pages` 패키지를 이용해 무료로 호스팅할 수 있습니다.
1. `vite.config.js` 파일에서 `base` 설정을 저장소 이름으로 변경합니다.
2. `npm run build` 후 생성된 `dist` 폴더의 내용을 `gh-pages` 브랜치로 푸시하거나, 설정에서 배포 소스를 지정합니다.

#### 옵션 C: 일반 웹 호스팅
`dist` 폴더 안에 있는 모든 파일(`index.html`, `assets` 폴더 등)을 사용 중인 웹 서버(Apache, Nginx 등)의 1public_html` 또는 루트 폴더에 업로드하면 바로 작동합니다.
