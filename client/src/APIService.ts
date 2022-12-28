export class APIService {

    private authToken: string;
    private refreshToken: string;

    constructor(authToken: string, refeshToken: string) {
        this.authToken = authToken;
        this.refreshToken = refeshToken;
        //verify that this user is actually the user they say they are first
    }

    /**
     * Gets the user's play data for the previous year
     */
    yearlyPlayData() {

    }

    /**
     * Gets the user's last 50 played songs
     */
    recentlyPlayed() {

    }

    /**
     * Gets the user's profile info
     */
    userInfo() {

    }
}