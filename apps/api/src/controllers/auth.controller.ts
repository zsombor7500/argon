import type { Request, Response, NextFunction } from 'express';


export function login(_req: Request, res: Response, _next: NextFunction) {
    res.status(500).json({
        'message': 'NOT IMPLEMENTED'
    });
}

export function refreshToken(_req: Request, res: Response, _next: NextFunction) {
    res.status(500).json({
        'message': 'NOT IMPLEMENTED'
    });
}

export function logout(_req: Request, res: Response, _next: NextFunction) {
    res.status(500).json({
        'message': 'NOT IMPLEMENTED'
    });
}
