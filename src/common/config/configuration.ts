
export default () => ({
   port: parseInt(process.env.PORT, 10) || 3000,
   database: {
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432
   },
   goerli_url: process.env.GOERLI_URL,
   failService: (message?: any) => {
      return {
         success: false,
         time: new Date(),
         message
      }
   },
   successService: (data?: any) => {
      return {
         success: true,
         time: new Date(),
         data
      }
   },

   royalty: () => {
      // max: async () => {
      //    await 
      // }
   }
});
