export class ResetTokenGenerator{

  generateRandomNumericToken(length: number) {
    let token: string = '';
    const characters = '0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      token += characters[randomIndex];
    }

    // Ensure the token length
    while (token.length < length) {
      token = '0' + token;
    }

    return parseInt(token, 10);
  }

}