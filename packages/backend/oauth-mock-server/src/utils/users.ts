import users from '../../data/users.json' assert { type: 'json' };

type TUser = {
    id: string;
    username: string;
    email: string;
    password: string;
    exp: number;
};
export function getUserByName(username: string): TUser | undefined {
    return users.find((u) => username === u.username);
}
